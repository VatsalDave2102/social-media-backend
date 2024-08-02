import express from 'express';
import validateRequest from '../middlewares/validateRequest';
import { register } from '../controllers/auth.controllers';
import { userRegistrationSchema } from '../schemas/auth.schemas';
import upload from '../middlewares/multer';

const authRouter = express.Router();

authRouter.post(
  '/register',
  upload.single('profilePicture'),
  validateRequest(userRegistrationSchema),
  register,
);

export default authRouter;
