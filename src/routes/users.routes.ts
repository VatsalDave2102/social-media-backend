import { Router } from 'express';

import { getUsers } from '../controllers/users.controllers';
import verifyToken from '../middlewares/verifyToken';

const userRouter = Router();

userRouter.get('/', verifyToken('accessToken'), getUsers);

export default userRouter;
