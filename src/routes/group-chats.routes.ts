import express from 'express';

import {
  addMembersToGroupChat,
  createGroupChat,
  getGroupChatDetails,
  getGroupChatMessages,
  removeMemberFromGroupChat,
  updateGroupChatSettings
} from '../controllers/group-chats.controllers';
import {
  addMembersToGroupChatSchema,
  createGroupChatSchema,
  removeMemberFromGroupChatSchema,
  updateGroupChatSettingsSchema
} from '../schemas/group-chats.schemas';
import upload from '../middlewares/multer';
import validateRequest from '../middlewares/validateRequest';
import verifyToken from '../middlewares/verifyToken';

const groupChatRouter = express.Router();

groupChatRouter.post(
  '/create',
  verifyToken('accessToken'),
  upload.single('groupIcon'),
  validateRequest(createGroupChatSchema),
  createGroupChat
  /*
  #swagger.summary = 'Create a new group chat'

  #swagger.description = 'Creates a group chat with specified members, customizable name, description, 
  and group icon. The creator must be friends with all added members, and a group icon is mandatory. 
  The creator automatically becomes the group owner with administrative privileges.'

  #swagger.requestBody = {
    required: true,
    content: {
      'multipart/form-data': {
        schema:{
          $ref: '#/components/schemas/CreateGroupChatRequest'
        }
      }
    }
  } 

  #swagger.responses[201] = {
    description: 'Chat created successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/CreateGroupChatResponse'
        },
        examples: {
          chatCreationResponse: {
            $ref: "#/components/examples/CreateGroupChatResponse"
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
  */
);

groupChatRouter.get(
  '/:chatId',
  verifyToken('accessToken'),
  getGroupChatDetails
  /*
  #swagger.summary = 'Get details of a specific group chat'

  #swagger.description = 'Fetches comprehensive details of a specific group chat, 
  including name, description, icon, owner, and member information. 
  Only group members and the owner can access these details. 
  The response includes all current group settings and participant information.'

  #swagger.responses[200] = {
    description: 'Chat details retrieved successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/GetGroupChatDetailsResponse'
        },
        examples: {
          chatDetailsResponse: {
            $ref: "#/components/examples/GetGroupChatDetailsResponse"
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

groupChatRouter.patch(
  '/:chatId/settings',
  verifyToken('accessToken'),
  upload.single('groupIcon'),
  validateRequest(updateGroupChatSettingsSchema),
  updateGroupChatSettings
  /* 
  #swagger.summary = 'Update settings of an existing group chat'

  #swagger.description = 
  'Enables group owners to modify chat settings including name, description, and group icon. 
  The endpoint accepts settings in JSON format and supports image uploads for the group icon. 
  Only the group owner has permission to update these settings.'

  #swagger.parameters['chatId'] = {
    in: 'path',                            
    description: 'group chat ID',                   
    required: true,                     
    type: 'string',                                                     
  } 

  #swagger.requestBody = {
    required: true,
    content: {
      'multipart/form-data': {
        schema:{
          $ref: '#/components/schemas/UpdateGroupChatSettingsRequest'
        }
      }
    }
  }   

  #swagger.responses[200] = {
    description: 'Chat settings updated successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/UpdateGroupChatSettingsResponse'
        },
        examples: {
          chatSettingsUpdationResponse: {
            $ref: "#/components/examples/UpdateGroupChatSettingsResponse"
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

groupChatRouter.get(
  '/:chatId/messages',
  verifyToken('accessToken'),
  getGroupChatMessages
  /* 
  #swagger.summary = 'Retrieve messages from a specific group chat'

  #swagger.description = 
  'Retrieves messages from a group chat with advanced filtering capabilities. 
  Features include pagination for efficient message loading, text-based search functionality, 
  and customizable batch sizes. Messages are returned in descending chronological order, 
  and only group members or the owner can access the chat history. 
  The response includes message content, metadata, and pagination details for seamless navigation 
  through the chat history.'

  #swagger.parameters['chatId'] = {
    in: 'path',                            
    description: 'group chat ID',                   
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
          $ref: '#/components/schemas/GetGroupChatMessagesResponse'
        },
        examples: {
          getMessagesResponse: {
            $ref: "#/components/examples/GetGroupChatMessagesResponse"
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

groupChatRouter.patch(
  '/:chatId/add-members',
  verifyToken('accessToken'),
  validateRequest(addMembersToGroupChatSchema),
  addMembersToGroupChat
  /* 
  #swagger.summary = 'Add members to a specific group chat'

  #swagger.description = 
  'Enables group owners to add new members to an existing group chat. 
  The endpoint validates friendship status, ensuring new members are friends with the owner. 
  It handles duplicate member checks, preventing re-adding existing members, and supports adding 
  multiple members simultaneously.'

  #swagger.parameters['chatId'] = {
    in: 'path',                            
    description: 'group chat ID',                   
    required: true,                     
    type: 'string',                                                     
  } 

  #swagger.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema:{
          $ref: '#/components/schemas/AddMembersToGroupChatRequest'
        }
      }
    }
  } 

  #swagger.responses[201] = {
    description: 'Members added successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/AddMembersToGroupChatResponse'
        },
        examples: {
          addMembersResponse: {
            $ref: "#/components/examples/AddMembersToGroupChatResponse"
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

groupChatRouter.patch(
  '/:chatId/remove-member',
  verifyToken('accessToken'),
  validateRequest(removeMemberFromGroupChatSchema),
  removeMemberFromGroupChat
  /* 
  #swagger.summary = 'Remove a member from a specific group chat' 

  #swagger.description = 
  'Enables group owners to remove members from an existing group chat. 
  The endpoint includes comprehensive validation checks: verifies member existence, 
  prevents owner removal, confirms removal permissions, and ensures the target member is 
  currently in the group. 
  Only group owners have the authority to remove members, and the operation is irreversible.'

  #swagger.parameters['chatId'] = {
    in: 'path',                            
    description: 'group chat ID',                   
    required: true,                     
    type: 'string',                                                     
  } 

  #swagger.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema:{
          $ref: '#/components/schemas/RemoveMemberFromGroupChatRequest'
        }
      }
    }
  } 

  #swagger.responses[200] = {
    description: 'Member deleted successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/RemoveMemberFromGroupChatResponse'
        },
        examples: {
          deleteMemberResponse: {
            $ref: "#/components/examples/RemoveMemberFromGroupChatResponse"
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

export default groupChatRouter;
