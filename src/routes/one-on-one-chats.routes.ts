import express from 'express';

import {
  createOneOnOneChat,
  getOneOnOneChatDetails,
  getOneOnOneChatMessages,
  updateOneOnOneChatSettings,
} from '../controllers/one-on-one-chats.controllers';
import {
  createOneOnOneChatSchema,
  updateOneOnOneChatSettingsSchema,
} from '../schemas/one-on-one-chats.schemas';
import validateRequest from '../middlewares/validateRequest';
import verifyToken from '../middlewares/verifyToken';

const oneOnOneChatRouter = express.Router();

oneOnOneChatRouter.post(
  '/create',
  validateRequest(createOneOnOneChatSchema),
  verifyToken('accessToken'),
  createOneOnOneChat,
);

oneOnOneChatRouter.get('/:chatId', verifyToken('accessToken'), getOneOnOneChatDetails);

oneOnOneChatRouter.patch(
  '/:chatId/settings',
  validateRequest(updateOneOnOneChatSettingsSchema),
  verifyToken('accessToken'),
  updateOneOnOneChatSettings,
);

oneOnOneChatRouter.get('/:chatId/messages', verifyToken('accessToken'), getOneOnOneChatMessages);

export default oneOnOneChatRouter;
