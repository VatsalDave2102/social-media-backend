import { authExamples, authSchemas } from './auth';
import { errorExamples, errorSchemas } from './errors';
import { friendRequestExamples, friendRequestsSchemas } from './friend-requests';
import { groupChatExamples, groupChatSchemas } from './group-chats';
import { messageExamples, messageSchemas } from './messages';
import { oneOnOneChatExamples, oneOnOneChatSchemas } from './one-on-one-chats';
import { userExamples, userSchemas } from './users';

const swaggerSchemas = {
  ...authSchemas,
  ...errorSchemas,
  ...friendRequestsSchemas,
  ...groupChatSchemas,
  ...messageSchemas,
  ...oneOnOneChatSchemas,
  ...userSchemas
};
const swaggerExamples = {
  ...authExamples,
  ...errorExamples,
  ...friendRequestExamples,
  ...groupChatExamples,
  ...messageExamples,
  ...oneOnOneChatExamples,
  ...userExamples
};

export { swaggerSchemas, swaggerExamples };
