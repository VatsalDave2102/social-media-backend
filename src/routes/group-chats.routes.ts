import express from 'express';

import { createGroupChat, getGroupChatDetails } from '../controllers/group-chats.controllers';
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

groupChatRouter.get('/:chatId', verifyToken('accessToken'), getGroupChatDetails);

export default groupChatRouter;