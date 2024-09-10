import mongoose, { Schema } from 'mongoose';
import { IUser } from '../users/userModel';

interface IProduct {
  _id?: mongoose.Types.ObjectId | string | null | undefined;
  user?: mongoose.Types.ObjectId | IUser | string;
  bundle?: mongoose.Types.ObjectId;
  name: string;
  qty: string;
  rate: string;
  gst?: string;
}

const productSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    bundle: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'ProductBundle',
    },
    user: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    qty: {
      type: String,
      required: true,
    },
    rate: {
      type: String,
      required: true,
    },
    gst: {
      type: String,
      default: '0',
    },
  },
  { timestamps: true }
);

productSchema.pre('save', async function (next) {
  const gst = Number(this.rate) * (18 / 100);
  this.rate = String(Number(this.rate) + gst);
  next();
});

const Product = mongoose.model<IProduct>('Product', productSchema, 'products');

export { Product, IProduct };
