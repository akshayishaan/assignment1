import express, { Router } from 'express';
import { signUp, signIn } from '../../controller/users/userAuthenticationController';

const router: Router = express.Router();

router.post('/sign_up', signUp);
router.post('/sign_in', signIn);

export default router;
