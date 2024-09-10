import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { IUser } from '../../models/users/userModel';

const signToken = (id: string): string => {
  const secret: string = process.env.JWT_SECRET as string;
  const token = jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

export const createSendToken = (user: IUser, statusCode: number, res: Response): void => {
  const id = user._id?.toString();
  const token: string = signToken(id ? id : '');
  const expiresIn: number = parseInt(process.env.JWT_COOKIE_EXPIRES_IN?.toString() ?? 'null');
  const cookieOptions: { expires: Date; httpOnly: boolean; secure: boolean } = {
    expires: new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: false,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  const newUser = {
    email: user.email,
    countryCode: user.countryCode,
    country: user.country,
    _id: user?._id,
    profilePic: user.profilePic,
  };

  res.status(statusCode).send({
    status: 'success',
    data: {
      user: newUser,
      token: token,
    },
  });
};

export const verifyToken = (token: string): any => {
  const secret: string = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret);
};
