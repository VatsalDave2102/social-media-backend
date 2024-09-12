import { Router } from 'express';

import { getUser, getUserChats, getUsers } from '../controllers/users.controllers';
import verifyToken from '../middlewares/verifyToken';

const userRouter = Router();

userRouter.get('/', verifyToken('accessToken'), getUsers);

userRouter.get('/chats', verifyToken('accessToken'), getUserChats);

userRouter.get('/:id', verifyToken('accessToken'), getUser);

export default userRouter;
