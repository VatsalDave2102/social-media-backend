import { authExamples, authSchemas } from './auth';
import { errorExamples, errorSchemas } from './errors';

const swaggerSchemas = { ...authSchemas, ...errorSchemas };
const swaggerExamples = { ...authExamples, ...errorExamples };

export { swaggerSchemas, swaggerExamples };
