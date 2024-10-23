import express from 'express';

import {
  cancelFriendRequest,
  sendFriendRequest,
  updateFriendRequest
} from '../controllers/friend-requests.controllers';
import {
  sendFriendRequestSchema,
  updateFriendRequestSchema
} from '../schemas/friend-requests.schemas';
import validateRequest from '../middlewares/validateRequest';
import verifyToken from '../middlewares/verifyToken';

const friendRequestsRouter = express.Router();

friendRequestsRouter.post(
  '/',
  verifyToken('accessToken'),
  validateRequest(sendFriendRequestSchema),
  sendFriendRequest
  /*
  #swagger.summary = "Sends a friend request from one user to another."

  #swagger.description = "This endpoint allows a user to send a friend request to another user. It checks if both the sender and receiver exist, verifies that they are not already friends, and ensures that no pending friend request exists between them. If all conditions are met, a new friend request is created and a success message is returned."

  #swagger.requestBody = {
    required: true,
    content: {
      'application/json':{
        schema: {
          $ref: '#/components/schemas/SendFriendRequestRequest'
        }
      }
    }
  }

  #swagger.responses[200] = {
    description: 'Friend request sent successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/SendFriendRequestResponse'
        },
        examples: {
          sendFriendRequestResponse: {
            $ref: '#/components/examples/SendFriendRequestResponse'
          }
        }
      }
    }
  }
*/
);

friendRequestsRouter.put(
  '/:id',
  verifyToken('accessToken'),
  validateRequest(updateFriendRequestSchema),
  updateFriendRequest
  /*
  #swagger.summary = "Updates the status of a friend request."

  #swagger.description = "This endpoint updates the status of a friend request based on its ID. It verifies the existence of the friend request, checks that it is still pending, and ensures the current user is the intended receiver. The request can either accept or reject the friend request, updating the relevant user relationships accordingly. If the friend request is not found, has already been processed, or the user is not the receiver, an error is thrown."

  #swagger.parameters['id'] = {
    in: 'path',
    type: 'string',
    description: 'Friend Request ID',
    required: true
  }

  #swagger.requestBody = {
    required: true,
    content: {
      'application/json':{
        schema: {
          $ref: '#/components/schemas/UpdateFriendRequestRequest'
        }
      }
    }
  }

  #swagger.responses[200] = {
    description: 'Shows response as per accepted/rejected status',
    content: {
      'application/json': {
        schema: {
          anyOf:[
            {
              $ref: '#/components/schemas/AcceptedFriendRequestResponse'
            },
            {
              $ref: '#/components/schemas/RejectedFriendRequestResponse'
            }
          ]
        },
        examples: {
          acceptedFriendRequestResponse: {
            $ref: '#/components/examples/AcceptedFriendRequestResponse'
          },
          rejectedFriendRequestResponse:{
            $ref: '#/components/examples/RejectedFriendRequestResponse'
          }
        }
      }
    }
  }

  #swagger.responses[403] = {
    description: "You are not the receiver of this friend request",
    content: {
      'application/json': {
        schema:{
          $ref: '#/components/schemas/ForbiddenResponse'
        },
        examples: {
          forbiddenResponse: {
             $ref: '#/components/examples/ForbiddenResponse'
          }
        }
      }           
    }
  }
*/
);

friendRequestsRouter.delete(
  '/:id',
  verifyToken('accessToken'),
  cancelFriendRequest
  /*
  #swagger.summary = "Cancels a pending friend request sent by the current user."

  #swagger.description = "This endpoint allows the current user to cancel a pending friend request they have sent. It verifies that the friend request exists, checks that the current user is the sender, and ensures the request is still pending before proceeding to delete it. If successful, a confirmation message is returned; otherwise, appropriate errors are thrown."

  #swagger.parameters['id'] = {
    in: 'path',
    type: 'string',
    description: 'Friend Request ID',
    required: true
  }

  #swagger.responses[200] = {
    description: 'Friend request cancelled successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/CancelFriendRequestResponse'
        },
        examples: {
          cancelFriendRequestResponse: {
            $ref: '#/components/examples/CancelFriendRequestResponse'
          }
        }
      }
    }
  }

  #swagger.responses[403] = {
    description: "You are not the sender of this friend request",
    content: {
      'application/json': {
        schema:{
          $ref: '#/components/schemas/ForbiddenResponse'
        },
        examples: {
          forbiddenResponse: {
             $ref: '#/components/examples/ForbiddenResponse'
          }
        }
      }           
    }
  }
*/
);

export default friendRequestsRouter;
