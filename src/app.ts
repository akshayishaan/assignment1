import express, { Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorController from './controller/error/errorController';
import userRouter from './routes/user/userRoutes';
import productRouter from './routes/product/productRoutes';

const app: Express = express();

app.use(morgan('dev'));
app.use(express.json({ limit: '100kb' }));
app.use(cors());

app.use('/api/v1/user', userRouter);
app.use('/api/v1/product', productRouter);
app.use(errorController);

export default app;
