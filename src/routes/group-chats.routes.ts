import express from 'express';

import {
  addMembersToGroupChat,
  createGroupChat,
  getGroupChatDetails,
  getGroupChatMessages,
  removeMemberFromGroupChat,
  updateGroupChatSettings,
} from '../controllers/group-chats.controllers';
import {
  createGroupChatSchema,
  removeMemberFromGroupChatSchema,
  updateGroupChatSettingsSchema,
} from '../schemas/group-chats.schemas';
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

groupChatRouter.patch(
  '/:chatId/settings',
  verifyToken('accessToken'),
  upload.single('groupIcon'),
  validateRequest(updateGroupChatSettingsSchema),
  updateGroupChatSettings,
);

groupChatRouter.get('/:chatId/messages', verifyToken('accessToken'), getGroupChatMessages);

groupChatRouter.patch('/:chatId/add-members', verifyToken('accessToken'), addMembersToGroupChat);

groupChatRouter.patch(
  '/:chatId/remove-member',
  verifyToken('accessToken'),
  validateRequest(removeMemberFromGroupChatSchema),
  removeMemberFromGroupChat,
);

export default groupChatRouter;
