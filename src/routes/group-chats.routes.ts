import express from 'express';

import { createGroupChat } from '../controllers/group-chats.controllers';
import { createGroupChatSchema } from '../schemas/group-chats.schemas';
import validateRequest from '../middlewares/validateRequest';
import verifyToken from '../middlewares/verifyToken';

const groupChatRouter = express.Router();

groupChatRouter.post(
  '/create',
  validateRequest(createGroupChatSchema),
  verifyToken('accessToken'),
  createGroupChat,
);

export default groupChatRouter;