import express, { Router } from 'express';
import { protect } from '../../controller/users/userAuthenticationController';
import { addProducts, getAllQuotations } from '../../controller/product/productController';

const router: Router = express.Router();
router.use(protect);
router.route('/').post(addProducts).get(getAllQuotations);

export default router;
