import { Router } from 'express';

import { getUser, getUserChats, getUsers, updateUser } from '../controllers/users.controllers';
import { updateUserSchema } from '../schemas/auth.schemas';
import upload from '../middlewares/multer';
import validateRequest from '../middlewares/validateRequest';
import verifyToken from '../middlewares/verifyToken';

const userRouter = Router();

userRouter.get('/', verifyToken('accessToken'), getUsers);

userRouter.get('/chats', verifyToken('accessToken'), getUserChats);

userRouter.get('/:id', verifyToken('accessToken'), getUser);

userRouter.put(
  '/:id',
  verifyToken('accessToken'),
  upload.single('profilePicture'),
  validateRequest(updateUserSchema),
  updateUser,
);

export default userRouter;
