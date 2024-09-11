import express from 'express';

import { createOneOnOneChat } from '../controllers/one-on-one-chats.controllers';
import { createOneOnOneChatSchema } from '../schemas/one-on-one-chats.schemas';
import validateRequest from '../middlewares/validateRequest';
import verifyToken from '../middlewares/verifyToken';

const oneOnOneChatRouter = express.Router();

oneOnOneChatRouter.post(
  '/create',
  validateRequest(createOneOnOneChatSchema),
  verifyToken('accessToken'),
  createOneOnOneChat,
);

export default oneOnOneChatRouter;
