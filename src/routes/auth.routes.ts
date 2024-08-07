import express from 'express';
import validateRequest from '../middlewares/validateRequest';
import {
  forgotPassword,
  login,
  logout,
  refreshToken,
  register,
} from '../controllers/auth.controllers';
import { userLoginSchema, userRegistrationSchema } from '../schemas/auth.schemas';
import upload from '../middlewares/multer';
import verifyToken from '../middlewares/verifyToken';

const authRouter = express.Router();

authRouter.post(
  '/register',
  upload.single('profilePicture'),
  validateRequest(userRegistrationSchema),
  register,
);

authRouter.post('/login', validateRequest(userLoginSchema), login);

authRouter.post('/logout', verifyToken('accessToken'), logout);

authRouter.post('/refresh-token', verifyToken('refreshToken'), refreshToken);

authRouter.post('/forgot-password', forgotPassword);

export default authRouter;
