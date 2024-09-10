import mongoose, { Schema } from 'mongoose';
import { IUser } from '../users/userModel';

interface IProductBundle {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId | IUser | string;
  bundleName?: string;
  url?: string;
}

const productBundleSchema: Schema = new Schema(
  {
    bundleName: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    url: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const ProductBundle = mongoose.model<IProductBundle>('ProductBundle', productBundleSchema, 'product_bundles');

export { ProductBundle, IProductBundle };
