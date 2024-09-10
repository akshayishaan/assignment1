import catchAsyncNormal from '../../utils/catchAsyncNormal';
import { User, IUser } from '../../models/users/userModel';
import AppError from '../../utils/appError';

type optional = string | null | undefined;

export const addNewUser = catchAsyncNormal(async (userData: IUser) => {
  const newUser: IUser = await User.create(userData);
  return newUser;
});

export const findUser = catchAsyncNormal(async (email: optional, countryCode: optional, phoneNumber: optional) => {
  if (!email && !(countryCode && phoneNumber)) throw new AppError('Missing Credentials', 404);

  const defaultFilterObj = { isActive: true, mobileNumberVerified: true };
  const filter: {
    countryCode?: string;
    phoneNumber?: string;
    email?: string;
    isActive: boolean;
  }[] = [];

  if (countryCode && phoneNumber) filter.push({ ...defaultFilterObj, countryCode, phoneNumber });
  if (email) filter.push({ ...defaultFilterObj, email });

  const user: IUser | null = await User.findOne({ $or: filter });
  return user;
});
