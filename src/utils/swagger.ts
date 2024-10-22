import dotenv from 'dotenv';
dotenv.config();

import swaggerAutogen from 'swagger-autogen';

import { BACKEND_SERVER_URL, NODE_ENV } from './env-variables';
import { swaggerExamples, swaggerSchemas } from '../docs';
import { version } from '../../package.json';

const doc = {
  info: {
    version,
    title: 'Social Media App',
    description: 'A social media app built with Node.js, Express, MongoDB, and TypeScript'
  },
  host: NODE_ENV === 'production' ? BACKEND_SERVER_URL : 'localhost:3000',
  basePath: '',
  schemes: NODE_ENV === 'production' ? ['https'] : ['http'],
  consumes: ['application/json', 'multipart/form-data'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication routes'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    '@schemas': swaggerSchemas,
    examples: swaggerExamples
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  servers: [
    {
      url: BACKEND_SERVER_URL,
      description: NODE_ENV === 'production' ? 'Render server' : 'Local server'
    }
  ]
};

const outputFile = '../../swagger-output.json';
const routes = ['../../src/app.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc);
