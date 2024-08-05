import express from 'express';
import validateRequest from '../middlewares/validateRequest';
import { login, logout, register } from '../controllers/auth.controllers';
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

export default authRouter;
