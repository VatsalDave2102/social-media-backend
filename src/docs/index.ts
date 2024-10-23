import { authExamples, authSchemas } from './auth';
import { errorExamples, errorSchemas } from './errors';
import { friendRequestExamples, friendRequestsSchemas } from './friend-requests';
import { groupChatExamples, groupChatSchemas } from './group-chats';
import { oneOnOneChatExamples, oneOnOneChatSchemas } from './one-on-one-chats';
import { userExamples, userSchemas } from './users';

const swaggerSchemas = {
  ...authSchemas,
  ...errorSchemas,
  ...friendRequestsSchemas,
  ...groupChatSchemas,
  ...oneOnOneChatSchemas,
  ...userSchemas
};
const swaggerExamples = {
  ...authExamples,
  ...errorExamples,
  ...friendRequestExamples,
  ...groupChatExamples,
  ...oneOnOneChatExamples,
  ...userExamples
};

export { swaggerSchemas, swaggerExamples };
