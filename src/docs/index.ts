import { authExamples, authSchemas } from './auth';
import { errorExamples, errorSchemas } from './errors';
import { oneOnOneChatExamples, oneOnOneChatSchemas } from './one-on-one-chats';

const swaggerSchemas = { ...authSchemas, ...errorSchemas, ...oneOnOneChatSchemas };
const swaggerExamples = { ...authExamples, ...errorExamples, ...oneOnOneChatExamples };

export { swaggerSchemas, swaggerExamples };
