import express from 'express';

import { deleteMessage, sendMessage } from '../controllers/messages.controllers';
import { sendMessageSchema } from '../schemas/messages.schemas';
import validateRequest from '../middlewares/validateRequest';
import verifyToken from '../middlewares/verifyToken';

const messagesRouter = express.Router();

messagesRouter.post(
  '/send',
  validateRequest(sendMessageSchema),
  verifyToken('accessToken'),
  sendMessage
  /*
  #swagger.summary = 'Send message to a group/one-on-one chat'

  #swagger.description = 'Enables users to send messages in either one-on-one or group chats. 
  The endpoint validates sender authorization, chat existence, and membership status. 
  It supports message creation in both chat types, updates the last message timestamp, and returns 
  the created message details. 
  The request body should contain only either a one-on-one chat ID or a group chat ID, not both.'

  #swagger.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema:{
          $ref: '#/components/schemas/SendMessageRequest'
        }
      }
    }
  } 

  #swagger.responses[201] = {
    description: 'Message sent successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/SendMessageResponse'
        },
        examples: {
          sendMessageResponse: {
            $ref: "#/components/examples/SendMessageResponse"
          }
        }
      }
    }
  }
    
  #swagger.responses[400] = {
    description: "Bad request",
    content: {
      'application/json': {
        schema:{
          $ref: "#/components/schemas/BadRequestResponse"
        },
        examples: {
          badRequestResponse: {
            $ref: "#/components/examples/BadRequestResponse"
          }
        }
      }           
    }
  }    
  */
);

messagesRouter.patch(
  '/delete/:messageId',
  verifyToken('accessToken'),
  deleteMessage
  /*
  #swagger.summary = 'Delete message from a group/one-on-one chat'

  #swagger.description = 'Enables message deletion in both one-on-one and group chats using a 
  soft delete approach. Message senders can delete their own messages, and in group chats, 
  group owners have additional deletion privileges. The deletion process preserves message structure 
  while removing content, maintaining chat history integrity. 
  The endpoint includes comprehensive validation of message existence, chat context, and user permissions.'

  #swagger.parameters['messageId'] = {
    in: 'path',                            
    description: 'message ID',                   
    required: true,                     
    type: 'string',                                                     
  } 

  #swagger.responses[200] = {
    description: 'Message deleted successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/DeleteMessageResponse'
        },
        examples: {
          deleteMessageResponse: {
            $ref: "#/components/examples/DeleteMessageResponse"
          }
        }
      }
    }
  }
  */
);

export default messagesRouter;
