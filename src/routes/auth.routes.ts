import express from 'express';

import {
  forgotPassword,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
} from '../controllers/auth.controllers';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  userLoginSchema,
  userRegistrationSchema,
} from '../schemas/auth.schemas';
import upload from '../middlewares/multer';
import validateRequest from '../middlewares/validateRequest';
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

authRouter.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);

authRouter.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);

export default authRouter;
