import express from 'express';

import {
  createOneOnOneChat,
  getOneOnOneChatDetails,
  getOneOnOneChatMessages,
  updateOneOnOneChatSettings
} from '../controllers/one-on-one-chats.controllers';
import {
  createOneOnOneChatSchema,
  updateOneOnOneChatSettingsSchema
} from '../schemas/one-on-one-chats.schemas';
import validateRequest from '../middlewares/validateRequest';
import verifyToken from '../middlewares/verifyToken';

const oneOnOneChatRouter = express.Router();

oneOnOneChatRouter.post(
  '/create',
  validateRequest(createOneOnOneChatSchema),
  verifyToken('accessToken'),
  createOneOnOneChat
  /* 
  #swagger.summary = 'Create a new one-on-one chat'

  #swagger.description = 
  'Initiates a secure, direct conversation between two users who are confirmed friends. 
  This endpoint verifies the friendship status, prevents duplicate chats, and establishes 
  a private space for personal communication.'

  #swagger.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema:{
          $ref: '#/components/schemas/CreateOneOnOneChatRequest'
        }
      }
    }
  } 

  #swagger.responses[201] = {
    description: 'Chat created successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/CreateOneOnOneChatResponse'
        },
        examples: {
          chatCreationResponse: {
            $ref: "#/components/examples/CreateOneOnOneChatResponse"
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

  #swagger.responses[404] = {
    description: 'Not found',
    content: {
      'application/json': {
        schema:{
          $ref: "#/components/schemas/NotFoundResponse"
        },
        examples: {
          notFoundResponse: {
            $ref: "#/components/examples/NotFoundResponse"
          }
        }
      }           
    }
  } 

  #swagger.responses[409] = {
    description: 'Conflict',
    content: {
      'application/json': {
        schema:{
          $ref: "#/components/schemas/ConflictResponse"
        },
        examples: {
          conflictResponse: {
            $ref: "#/components/examples/ConflictResponse"
          }
        }
      }           
    }
  } 
  */
);

oneOnOneChatRouter.get(
  '/:chatId',
  verifyToken('accessToken'),
  getOneOnOneChatDetails
  /* 
  #swagger.summary = 'Get details of an existing one-on-one chat'

  #swagger.description = 
  'Fetches detailed information about an existing one-on-one chat, including participant details, 
  chat settings, and metadata. 
  This endpoint provides a complete overview of the chat's current state and configuration.'

  #swagger.parameters['chatId'] = {
    in: 'path',                            
    description: 'one-on-one chat ID',                   
    required: true,                     
    type: 'string',                                                     
  } 

  #swagger.responses[200] = {
    description: 'Chat details retrieved successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/GetOneOnOneChatDetailsResponse'
        },
        examples: {
          chatCreationResponse: {
            $ref: "#/components/examples/GetOneOnOneChatDetailsResponse"
          }
        }
      }
    }
  }

  #swagger.responses[404] = {
    description: 'Not found',
    content: {
      'application/json': {
        schema:{
          $ref: "#/components/schemas/NotFoundResponse"
        },
        examples: {
          notFoundResponse: {
            $ref: "#/components/examples/NotFoundResponse"
          }
        }
      }           
    }
  } 

  #swagger.responses[409] = {
    description: 'Conflict',
    content: {
      'application/json': {
        schema:{
          $ref: "#/components/schemas/ConflictResponse"
        },
        examples: {
          conflictResponse: {
            $ref: "#/components/examples/ConflictResponse"
          }
        }
      }           
    }
  } 
  */
);

oneOnOneChatRouter.patch(
  '/:chatId/settings',
  validateRequest(updateOneOnOneChatSettingsSchema),
  verifyToken('accessToken'),
  updateOneOnOneChatSettings
  /* 
  #swagger.summary = 'Update settings of an existing one-on-one chat'

  #swagger.description = 
  'Modifies the settings of an existing one-on-one chat. This endpoint allows users to toggle  
  the vanish mode on or off for v1, enhancing privacy options for sensitive conversations.'

  #swagger.parameters['chatId'] = {
    in: 'path',                            
    description: 'one-on-one chat ID',                   
    required: true,                     
    type: 'string',                                                     
  } 

  #swagger.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema:{
          $ref: '#/components/schemas/UpdateOneOnOneChatSettingsRequest'
        }
      }
    }
  }   

  #swagger.responses[200] = {
    description: 'Chat settings updated successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/UpdateOneOnOneChatSettingsResponse'
        },
        examples: {
          chatUpdationResponse: {
            $ref: "#/components/examples/UpdateOneOnOneChatSettingsResponse"
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

  #swagger.responses[403] = {
    description: 'Forbidden',
    content: {
      'application/json': {
        schema:{
          $ref: "#/components/schemas/ForbiddenResponse"
        },
        examples: {
          forbiddenResponse: {
            $ref: "#/components/examples/ForbiddenResponse"
          }
        }
      }           
    }
  } 
    
  #swagger.responses[404] = {
    description: 'Not found',
    content: {
      'application/json': {
        schema:{
          $ref: "#/components/schemas/NotFoundResponse"
        },
        examples: {
          notFoundResponse: {
            $ref: "#/components/examples/NotFoundResponse"
          }
        }
      }           
    }
  } 
  */
);

oneOnOneChatRouter.get(
  '/:chatId/messages',
  verifyToken('accessToken'),
  getOneOnOneChatMessages
  /* 
  #swagger.summary = 'Retrieve messages from a specific one-on-one chat'

  #swagger.description = 
  'Fetches the message history of an existing one-on-one chat. 
  This endpoint allows users to access the conversation content, including text messages, 
  timestamps, and any associated metadata. 
  It supports pagination for efficient retrieval of large message histories.'

  #swagger.parameters['chatId'] = {
    in: 'path',                            
    description: 'one-on-one chat ID',                   
    required: true,                     
    type: 'string',                                                     
  } 

  #swagger.parameters['cursor'] = {
    in: 'query',                            
    description: 'Pagination cursor for fetching the next set of results',                   
    required: false,                     
    type: 'string',                                                     
  } 

  #swagger.parameters['search'] = {
    in: 'query',                            
    description: 'Search term to filter messages by content',                   
    required: false,                     
    type: 'string',                                                     
  } 

  #swagger.parameters['take'] = {
    in: 'query',                            
    description: 'Number of messages to retrieve per request',                   
    required: false,                     
    type: 'string',                                                     
  } 

  #swagger.responses[200] = {
    description: 'Chat messages retrieved successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/GetOneOnOneChatMessagesResponse'
        },
        examples: {
          getMessagesResponse: {
            $ref: "#/components/examples/GetOneOnOneChatMessagesResponse"
          }
        }
      }
    }
  }

  #swagger.responses[403] = {
    description: 'Forbidden',
    content: {
      'application/json': {
        schema:{
          $ref: "#/components/schemas/ForbiddenResponse"
        },
        examples: {
          forbiddenResponse: {
            $ref: "#/components/examples/ForbiddenResponse"
          }
        }
      }           
    }
  } 
    
  #swagger.responses[404] = {
    description: 'Not found',
    content: {
      'application/json': {
        schema:{
          $ref: "#/components/schemas/NotFoundResponse"
        },
        examples: {
          notFoundResponse: {
            $ref: "#/components/examples/NotFoundResponse"
          }
        }
      }           
    }
  } 
  */
);

export default oneOnOneChatRouter;
