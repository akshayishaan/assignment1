import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import catchAsyncNormal from '../../utils/catchAsyncNormal';
import { IProduct, Product } from '../../models/product/productModel';
import mongoose, { mongo } from 'mongoose';
import { IProductBundle, ProductBundle } from '../../models/product/productBundleModel';
import { getTemplateForQuotation } from '../../helpers/product/getTemplateForQuotation';

dotenv.config({});

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY as string,
    secretAccessKey: process.env.ACCESS_KEY_SECRET as string,
  },
});

async function ensureDirectoryExistence(filePath: string): Promise<void> {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

const generatePdfForTheProducts = catchAsyncNormal(async (bundle: mongoose.Types.ObjectId | string, bundleName: string) => {
  let totalAmount = 0;

  const products = await Product.find({ bundle });
  products.forEach((product: IProduct) => {
    totalAmount += Number(product.rate) * Number(product.qty);
  });

  const finalAmountWithGST = totalAmount + totalAmount * 0.18;

  let htmlFile: string = await getTemplateForQuotation(products, totalAmount, finalAmountWithGST);
  const filePath = `${__dirname}/../../TEMP_FILES/${bundleName}.pdf`;
  await ensureDirectoryExistence(filePath);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(htmlFile);
  const pdfDoc = await page.pdf({
    path: filePath,
    printBackground: true,
    margin: { top: '100px' },
    format: 'A4',
  });

  const params = {
    Bucket: 'cashkarharkadam',
    Key: `quotations/${bundleName}.pdf`,
    Body: fs.createReadStream(filePath),
    ContentType: 'application/pdf',
  };

  const command = new PutObjectCommand(params);
  const data = await s3Client.send(command);
  const url = `${process.env.AWS_URL_PREFIX}/${params.Key}`;

  fs.unlinkSync(filePath);
  await browser.close();
  await ProductBundle.findByIdAndUpdate(bundle, { url });

  return url;
});

export const addProductsDA = catchAsyncNormal(async (products: IProduct[], bundleName: string, userId: mongoose.Types.ObjectId | string) => {
  const bundle: IProductBundle = await ProductBundle.create({ bundleName, user: userId });

  const productsToBeInserted: IProduct[] = products.map((product: IProduct) => {
    return {
      name: product.name,
      qty: product.qty,
      rate: product.rate,
      user: userId,
      bundle: bundle._id,
    };
  });

  await Product.insertMany(productsToBeInserted);
  const url = await generatePdfForTheProducts(bundle._id, bundleName);
  return url;
});

export const getAllQuotationsDA = catchAsyncNormal(async (userId: mongoose.Types.ObjectId | string) => {
  const quotations = await ProductBundle.find({ user: userId }, { _id: 0, __v: 0, user: 0 });
  return quotations;
});
