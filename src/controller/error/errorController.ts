import { Request, Response, NextFunction } from 'express';
import AppError from '../../utils/appError';

const handleDuplicateFieldsDB = (err: any) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('translation:invalidToken', 404);

const handleJWTExpiredError = () => new AppError('translation:tokenExpired', 401);

const sendErrorDev = (err: any, req: Request, res: Response) => {
  console.log(err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: any, req: Request, res: Response) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error(err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

export default (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let customError = { ...err };

    if (customError.name === 'CastError') {
      customError = handleCastErrorDB(customError);
    }
    if (customError.code === 11000) {
      customError = handleDuplicateFieldsDB(customError);
    }
    if (customError.name === 'ValidationError') {
      customError = handleValidationErrorDB(customError);
    }
    if (customError.name === 'JsonWebTokenError') {
      customError = handleJWTError();
    }
    if (customError.name === 'TokenExpiredError') {
      customError = handleJWTExpiredError();
    }
    if (customError.name === 'MulterError') {
      customError = new AppError(customError.message, 500);
    }
    sendErrorProd(customError, req, res);
  }
};
