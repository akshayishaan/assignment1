import { NextFunction, Request, Response } from 'express';
import { validationResult, matchedData } from 'express-validator';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../utils/appError';
import { IUser, User } from '../../models/users/userModel';
import { createSendToken, verifyToken } from '../../helpers/users/jwtTokenHelper';
import { changedPasswordAfter, correctPassword } from '../../helpers/users/passwordVerification';
import { addNewUser, findUser } from '../../dataAccess/users/userAuthenticationDA';
import { logInValidator, signUpValidator } from '../../validator/user.auth.validator';

export const signUp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await Promise.all(signUpValidator.map((validation) => validation.run(req)));

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new AppError(`${errors.array().at(0)?.msg}`, 400));
  }

  const { email, countryCode, phoneNumber } = matchedData(req);
  const data = matchedData(req, { includeOptionals: true });

  const user = await findUser(email, countryCode, phoneNumber);
  if (user) {
    return next(new AppError('User Already Exists!', 409));
  }

  const userDoc: IUser = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: email,
    dateOfBirth: data.dateOfBirth,
    countryCode: countryCode,
    country: 'India',
    phoneNumber: phoneNumber,
    password: data.password,
    passwordConfirm: data.passwordConfirm,
    gender: data.gender,
    profilePic: data.profilePic,
  };

  const newUser: IUser = await addNewUser(userDoc);
  createSendToken(newUser, 200, res);
});

export const signIn = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await Promise.all(logInValidator.map((validation) => validation.run(req)));

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new AppError(`${errors.array().at(0)?.msg}`, 400));
  }
  const { phoneNumber, countryCode, password } = matchedData(req);

  const user: IUser | null = await findUser(null, countryCode, phoneNumber);
  if (!user || !(await correctPassword(password, user.password))) return next(new AppError('Invalid Credentials', 401));

  createSendToken(user, 200, res);
});

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | null = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in.', 401));
  }

  const decoded: { id: string; iat: number } = verifyToken(token);

  const currentUser: IUser | null = await User.findOne(
    { _id: decoded.id, isActive: true },
    {
      _id: 1,
      passwordUpdatedAt: 1,
      isHNVerified: 1,
      country: 1,
      insuranceCategory: 1,
    }
  );
  if (!currentUser) {
    return next(new AppError("User Token Doesn't exists", 401));
  }

  if (changedPasswordAfter(decoded.iat, currentUser.passwordChangedAt)) {
    return next(new AppError('Your password has been changed. Please login again.', 401));
  }

  req.user = currentUser;

  next();
});
