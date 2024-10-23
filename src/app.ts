import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUI from 'swagger-ui-express';

import authRouter from './routes/auth.routes';
import { errorConverter } from './middlewares/errorConverter';
import { errorHandler } from './middlewares/errorHandler';
import friendRequestsRouter from './routes/friend-requests.routes';
import groupChatRouter from './routes/group-chats.routes';
import logger from './utils/logger';
import messagesRouter from './routes/messages.routes';
import oneOnOneChatRouter from './routes/one-on-one-chats.routes';
import swaggerDocument from '../swagger-output.json';
import userRouter from './routes/users.routes';

const app = express();

app.set('trust proxy', 1 /* number of proxies between user and server */);

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.get('/', (req, res) => {
  logger.info('Home route accessed');
  res.json({ message: 'Welcome to the API' });
});

app.get('/ip', (request, response) => response.send(request.ip));

// Swagger
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Auth Routes
app.use('/api/v1/auth', authRouter);

// User Routes
app.use(
  '/api/v1/users',
  userRouter
  /*
  #swagger.tags = ['User']

  #swagger.security = [{
   "bearerAuth": []
  }] 

  #swagger.responses[404] = {
    description: "Not found",
    content: {
      'application/json': {
        schema:{
          $ref: '#/components/schemas/NotFoundResponse'
        },
        examples: {
          notFoundResponse: {
             $ref: '#/components/examples/NotFoundResponse'
          }
        }
      }           
    }
  }

  #swagger.responses[401] = {
    description: "Unauthorized Access",
    content: {
      'application/json': {
        schema:{
          $ref: "#/components/schemas/UnauthorizedAccessResponse"
        },
        examples: {
          unauthorizedAccessResponse: {
            $ref: "#/components/examples/UnauthorizedAccessResponse"
          }
        }
      }           
    }
  }

  #swagger.responses[500] = {
    description: 'Internal server error',
    content: {
      'application/json': {
        schema:{
          $ref: "#/components/schemas/InternalServerErrorResponse"
        },
        examples: {
          internalServerErrorResponse: {
            $ref: "#/components/examples/InternalServerErrorResponse"
          }
        }
      }           
    }
  }
  */
);

// Friend Requests Routes
app.use('/api/v1/friend-requests', friendRequestsRouter);

// One on one chat routes
app.use(
  '/api/v1/chats/one-on-one',
  oneOnOneChatRouter
  /* 
  #swagger.tags = ['One-On-One Chats']

  #swagger.security = [{
   "bearerAuth": []
  }] 

  #swagger.responses[401] = {
    description: "Unauthorized Access",
    content: {
      'application/json': {
        schema:{
          $ref: "#/components/schemas/UnauthorizedAccessResponse"
        },
        examples: {
          unauthorizedAccessResponse: {
            $ref: "#/components/examples/UnauthorizedAccessResponse"
          }
        }
      }           
    }
  }   

  #swagger.responses[500] = {
    description: 'Internal server error',
    content: {
      'application/json': {
        schema:{
          $ref: "#/components/schemas/InternalServerErrorResponse"
        },
        examples: {
          internalServerErrorResponse: {
            $ref: "#/components/examples/InternalServerErrorResponse"
          }
        }
      }           
    }
  } 
*/
);

// Group Chat Routes
app.use('/api/v1/chats/group', groupChatRouter);

// Message Routes
app.use('/api/v1/messages', messagesRouter);

app.use(errorConverter);
app.use(errorHandler);

export default app;
