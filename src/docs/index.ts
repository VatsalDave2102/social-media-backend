import { authExamples, authSchemas } from './auth';
import { errorExamples, errorSchemas } from './errors';
import { oneOnOneChatExamples, oneOnOneChatSchemas } from './one-on-one-chats';
import { userExamples, userSchemas } from './users';

const swaggerSchemas = { ...authSchemas, ...errorSchemas, ...oneOnOneChatSchemas, ...userSchemas };
const swaggerExamples = {
  ...authExamples,
  ...errorExamples,
  ...oneOnOneChatExamples,
  ...userExamples
};

export { swaggerSchemas, swaggerExamples };
