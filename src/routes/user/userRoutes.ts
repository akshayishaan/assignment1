import express, { Router } from 'express';
import userAuthenticationRouter from './userAuthenticationRoutes';
import { IUser } from '../../models/users/userModel';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}

const router: Router = express.Router();

router.use('/auth', userAuthenticationRouter);

export default router;
