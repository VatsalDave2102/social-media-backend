import express from 'express';

import { createGroupChat, getGroupChatDetails } from '../controllers/group-chats.controllers';
import { createGroupChatSchema } from '../schemas/group-chats.schemas';
import upload from '../middlewares/multer';
import validateRequest from '../middlewares/validateRequest';
import verifyToken from '../middlewares/verifyToken';

const groupChatRouter = express.Router();

groupChatRouter.post(
  '/create',
  verifyToken('accessToken'),
  upload.single('groupIcon'),
  validateRequest(createGroupChatSchema),
  createGroupChat,
);

groupChatRouter.get('/:chatId', verifyToken('accessToken'), getGroupChatDetails);

export default groupChatRouter;