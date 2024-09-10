import { IProduct } from '../../models/product/productModel';
import catchAsyncNormal from '../../utils/catchAsyncNormal';

export const getTemplateForQuotation = catchAsyncNormal(async (products: IProduct[], totalAmount: number, finalAmountWithGST: number) => {
  const generateProductRows = (products: IProduct[]) => {
    const productsHTML = products
      .map(
        (product) => `
      <tr>
        <td>${product.name}</td>
        <td>${product.qty}</td>
        <td>${product.rate}</td>
        <td>${(Number(product.qty) * Number(product.rate)).toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    return productsHTML;
  };

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Dynamic Invoice Calculation</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            width: 80%;
            margin: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
            font-size: 14px;
          }
          th, td {
            padding: 10px;
            text-align: center;
            border: 1px solid #ddd;
          }
          th {
            background-color: #f4f4f4;
            font-weight: bold;
          }
          #summary {
            width: auto;
            margin-left: auto;
            margin-right: 0;
            font-size: 14px;
            text-align: right;
          }
          #summary th, #summary td {
            border: none;
            padding: 15px;
          }
          .summary-total {
            border-top: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
            color: #58b2cf;
          }
          .footer {
            background-color: #2d3436;
            background-image: linear-gradient(180deg, #2d3436 0%, #000000 80%);
            color: white;
            border-radius: 10px;
            padding: 20px;
            max-width: 800px;
            margin: 40px auto;
            text-align: left;
          }
          .footer-heading {
            font-weight: bold;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <table id="invoice-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody id="invoice-body">
            ${generateProductRows(products)}
          </tbody>
        </table>
    
        <table id="summary">
          <tr>
            <th>Total :</th>
            <td>INR ${totalAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <th>GST :</th>
            <td>18%</td>
          </tr>
          <tr class="summary-total">
            <th>Grand Total :</th>
            <td>₹ ${finalAmountWithGST.toFixed(2)}</td>
          </tr>
        </table>
    
        <p id="validity" style="text-align: left; margin-top: 20px;"></p>
    
        <div class="footer">
          <p class="footer-heading">Terms and Conditions</p>
          <p>
            We are happy to supply any further information you may need and trust
            that you call on us to fill your order, which will receive our prompt
            and careful attention.
          </p>
        </div>
      </body>
    </html>
  `;

  return htmlTemplate;
});
