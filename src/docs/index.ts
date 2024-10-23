import { authExamples, authSchemas } from './auth';
import { errorExamples, errorSchemas } from './errors';
import { friendRequestExamples, friendRequestsSchemas } from './friend-requests';
import { oneOnOneChatExamples, oneOnOneChatSchemas } from './one-on-one-chats';
import { userExamples, userSchemas } from './users';

const swaggerSchemas = {
  ...authSchemas,
  ...errorSchemas,
  ...friendRequestsSchemas,
  ...oneOnOneChatSchemas,
  ...userSchemas
};
const swaggerExamples = {
  ...authExamples,
  ...errorExamples,
  ...friendRequestExamples,
  ...oneOnOneChatExamples,
  ...userExamples
};

export { swaggerSchemas, swaggerExamples };
