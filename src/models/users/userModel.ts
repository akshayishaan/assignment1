import mongoose, { Schema, Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

interface IUser {
  _id?: mongoose.Types.ObjectId | string | null | undefined;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  countryCode: string;
  country: string; // If it was a big app, then better to have a id linked to some doc in your db.
  phoneNumber: string;
  password: string;
  passwordConfirm: string;
  gender: string;
  passwordChangedAt?: Date;
  mobileNumberVerified?: boolean;
  emailVerified?: boolean;
  profilePic?: string;
  isActive?: boolean;
}

const userSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide first and middle name!'],
    },

    lastName: {
      type: String,
      required: [true, 'Please provide last name!'],
    },

    email: { type: String, required: [true, 'Please provide email!'] },

    dateOfBirth: {
      type: Date,
      required: [true, 'Please provide date of birth!'],
    },

    countryCode: {
      type: String,
      required: [true, 'Please provide country code!'],
    },

    country: {
      type: String,
      required: [true, 'Please provide a valid country'],
    },

    mobileNumberVerified: {
      type: Boolean,
      default: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    phoneNumber: {
      type: String,
      required: [true, 'Please provide phone number!'],
    },

    password: {
      type: String,
      required: [true, 'Please provide a valid password'],
    },

    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password.'],
      validate: {
        validator: function (this: IUser, el: string) {
          return el === this.password;
        },
        message: 'Passwords are not the same.',
      },
    },

    passwordChangedAt: {
      type: Date,
      default: Date.now,
    },

    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Please provide gender!'],
    },

    profilePic: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const password: string = this.password as string;
  this.password = await bcrypt.hash(password, 12);
  this.passwordConfirm = undefined;
  this.passwordChangedAt = Date.now() - 10000;
  next();
});

const User = mongoose.model<IUser>('User', userSchema, 'users');

export { User, IUser };
