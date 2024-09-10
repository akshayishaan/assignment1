import { NextFunction, Request, Response } from 'express';
import { validationResult, matchedData } from 'express-validator';
const { v4: uuidv4 } = require('uuid');
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/appError';
import { addProductsValidator } from '../../validator/user.auth.validator';
import { IProduct } from '../../models/product/productModel';
import { addProductsDA, getAllQuotationsDA } from '../../dataAccess/product/productController';

export const addProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?._id) return next(new AppError('Session Expired', 403));

  await Promise.all(addProductsValidator.map((validation) => validation.run(req)));

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new AppError(`${errors.array().at(0)?.msg}`, 400));
  }

  const { products }: { products: IProduct[] } = matchedData(req) as { products: IProduct[] };
  const bundleName: string = uuidv4();
  const url: string = await addProductsDA(products, bundleName, req.user._id);

  res.status(200).json({
    status: 'success',
    data: {
      url,
    },
  });
});

export const getAllQuotations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?._id) return next(new AppError('Session Expired', 403));

  const quotations = await getAllQuotationsDA(req.user._id);

  res.status(200).json({
    status: 'success',
    data: {
      quotations,
    },
  });
});
