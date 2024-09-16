import { Router } from 'express';

import {
  changePassword,
  deleteUser,
  getFriendRequests,
  getFriends,
  getSuggestedFriends,
  getUser,
  getUserChats,
  getUsers,
  unfriendUser,
  updateUser,
} from '../controllers/users.controllers';
import { changePasswordSchema, updateUserSchema } from '../schemas/auth.schemas';
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

userRouter.delete('/:id', verifyToken('accessToken'), deleteUser);

userRouter.put(
  '/:id/change-password',
  verifyToken('accessToken'),
  validateRequest(changePasswordSchema),
  changePassword,
);

userRouter.get('/:id/friends', verifyToken('accessToken'), getFriends);

userRouter.get('/:id/friend-requests', verifyToken('accessToken'), getFriendRequests);

userRouter.post('/:id/unfriend/:friendId', verifyToken('accessToken'), unfriendUser);

userRouter.get('/:id/suggested-friends', verifyToken('accessToken'), getSuggestedFriends);

export default userRouter;
