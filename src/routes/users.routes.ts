import { Router } from 'express';

import {
  changePassword,
  deleteUser,
  getAuthenticatedUser,
  getFriendRequests,
  getFriends,
  getFriendshipStatus,
  getMutualFriends,
  getSuggestedFriends,
  getUser,
  getUserChats,
  getUsers,
  unfriendUser,
  updateUser
} from '../controllers/users.controllers';
import { changePasswordSchema, updateUserSchema } from '../schemas/auth.schemas';
import upload from '../middlewares/multer';
import validateRequest from '../middlewares/validateRequest';
import verifyToken from '../middlewares/verifyToken';

const userRouter = Router();

userRouter.get(
  '/',
  verifyToken('accessToken'),
  getUsers
  /*
  #swagger.summary = 'Fetch all users'

  #swagger.description = 'This endpoint retrieves a paginated list of users, with optional search functionality. It supports cursor-based pagination and returns user information along with pagination metadata such as total count, next page cursor, and whether there are more results.'

  #swagger.parameters['cursor'] = {
    in: 'query',
    type: 'string',
    description: 'Cursor for fetching the next page of results (i.e., the ID of the last user from the previous page).',
    required: false
  }

  #swagger.parameters['take'] = {
    in: 'query',
    type: 'string',
    description: 'The number of users to fetch in one request. Defaults to a predefined batch size.',
    required: false
  }

   #swagger.parameters['query'] = {
    in: 'query',
    type: 'string',
    description: 'Optional search query to filter users by their name.',
    required: false
  }

  #swagger.responses[200] = {
    description: 'Users fetched successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/GetUsersResponse'
        },
        examples: {
          getUsersResponse: {
            $ref: '#/components/examples/GetUsersResponse'
          }
        }
      }
    }
  }
  */
);

userRouter.get(
  '/me',
  verifyToken('accessToken'),
  getAuthenticatedUser
  /*
  #swagger.summary = 'Retrieves an authenticated user.'

  #swagger.description = "This endpoint retrieves an authenticated user using JWT token. It returns the user's profile information, including name, email, bio, profile picture, friend lists, group memberships, and timestamps for creation and updates. If the user is not found or has been deleted, a 'User not found' error is returned."

  #swagger.responses[200] = {
    description: 'Authenticated user fetched successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/GetUserResponse'
        },
        examples: {
          getUserResponse: {
            $ref: '#/components/examples/GetUserResponse'
          }
        }
      }
    }
  }
*/
);

userRouter.get(
  '/chats',
  verifyToken('accessToken'),
  getUserChats
  /*
  #swagger.summary = 'Fetch all chats of user'

  #swagger.description = 'This endpoint fetches a paginated list of chats for the current user, including both one-on-one chats and group chats. It supports optional search by chat participant or group name, as well as cursor-based pagination for efficient scrolling through chat history.'

  #swagger.parameters['cursor'] = {
    in: 'query',
    type: 'string',
    description: 'Cursor for fetching the next page of results (i.e., the ID of the last user from the previous page).',
    required: false
  }

  #swagger.parameters['take'] = {
    in: 'query',
    type: 'string',
    description: 'The number of users to fetch in one request. Defaults to a predefined batch size.',
    required: false
  }

   #swagger.parameters['query'] = {
    in: 'query',
    type: 'string',
    description: 'Optional search query to filter users by their name.',
    required: false
  }

  #swagger.responses[200] = {
    description: 'User chats fetched successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/GetUserChatsResponse'
        },
        examples: {
          getUserChatsResponse: {
            $ref: '#/components/examples/GetUserChatsResponse'
          }
        }
      }
    }
  }
  */
);

userRouter.get(
  '/:id',
  verifyToken('accessToken'),
  getUser
  /*
  #swagger.summary = 'Retrieves a single user by their ID.'

  #swagger.description = "This endpoint retrieves a single user by their ID. It returns the user's profile information, including name, email, bio, profile picture, friend lists, group memberships, and timestamps for creation and updates. If the user is not found or has been deleted, a 'User not found' error is returned."


  #swagger.parameters['id'] = {
    in: 'path',
    type: 'string',
    description: 'Unique MongoDB ID',
    required: true
  }

  #swagger.responses[200] = {
    description: 'User fetched successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/GetUserResponse'
        },
        examples: {
          getUserResponse: {
            $ref: '#/components/examples/GetUserResponse'
          }
        }
      }
    }
  }
*/
);

userRouter.put(
  '/:id',
  verifyToken('accessToken'),
  upload.single('profilePicture'),
  validateRequest(updateUserSchema),
  updateUser
  /*
  #swagger.summary = "Updates a user's profile information including name, bio, and profile picture."

  #swagger.description = "This endpoint allows a user to update their profile information, including their name, bio, and profile picture. The user must be authenticated and can only update their own profile. The profile picture, if provided, is uploaded to Cloudinary, and the previous one is deleted. It returns the updated user data upon success."


  #swagger.parameters['id'] = {
    in: 'path',
    type: 'string',
    description: 'Unique MongoDB ID',
    required: true
  }

  #swagger.requestBody = {
    required: true,
    content: {
      'multipart/form-data':{
        schema: {
          $ref: '#/components/schemas/UpdateUserRequest'
        }
      }
    }
  }

  #swagger.responses[200] = {
    description: 'User updated successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/UpdateUserResponse'
        },
        examples: {
          updateUserResponse: {
            $ref: '#/components/examples/UpdateUserResponse'
          }
        }
      }
    }
  }

  #swagger.responses[403] = {
    description: "You can only update your own profile",
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

userRouter.delete(
  '/:id',
  verifyToken('accessToken'),
  deleteUser
  /*
  #swagger.summary = "Soft deletes a user by setting the isDeleted flag to true."

  #swagger.description =  "Soft deletes a user by setting the isDeleted flag to true. The user can only delete their own profile. This action anonymizes the user's information, removes their profile picture, deletes all sent and received friend requests, and sets the deletedAt timestamp."


  #swagger.parameters['id'] = {
    in: 'path',
    type: 'string',
    description: 'Unique MongoDB ID',
    required: false
  }

  #swagger.responses[200] = {
    description: 'User deleted successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/DeleteUserResponse'
        },
        examples: {
          deleteUserResponse: {
            $ref: '#/components/examples/DeleteUserResponse'
          }
        }
      }
    }
  }

  #swagger.responses[403] = {
    description: "You can only delete your own profile",
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

userRouter.put(
  '/:id/change-password',
  verifyToken('accessToken'),
  validateRequest(changePasswordSchema),
  changePassword
  /*
  #swagger.summary = "Changes the user's password after verifying the old password."

  #swagger.description = "This endpoint allows the user to change their password after verifying the old password. It checks if the old password is correct, hashes the new password, and updates the user's password in the database. The user can only change their own password, and a success message is returned upon successful update."


  #swagger.parameters['id'] = {
    in: 'path',
    type: 'string',
    description: 'Unique MongoDB ID',
    required: true
  }

  #swagger.requestBody = {
    required: true,
    content: {
      'application/json':{
        schema: {
          $ref: '#/components/schemas/ChangePasswordRequest'
        }
      }
    }
  }

  #swagger.responses[200] = {
    description: 'Password changed successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ChangePasswordResponse'
        },
        examples: {
          changePasswordResponse: {
            $ref: '#/components/examples/ChangePasswordResponse'
          }
        }
      }
    }
  }

  #swagger.responses[403] = {
    description: "You can only change your own password",
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

userRouter.get(
  '/:id/friends',
  verifyToken('accessToken'),
  getFriends
  /*
  #swagger.summary = "Retrieves a paginated list of friends for a specific user."

  #swagger.description = "This endpoint retrieves a paginated list of friends for a specific user. It supports search functionality by friend name and cursor-based pagination for efficient navigation through large lists. The response includes friend details, pagination info, and allows skipping to the next set of results."

  #swagger.parameters['id'] = {
    in: 'path',
    type: 'string',
    description: 'Unique MongoDB ID',
    required: true
  }

  #swagger.parameters['cursor'] = {
    in: 'query',
    type: 'string',
    description: 'Cursor for fetching the next page of results (i.e., the ID of the last user from the previous page).',
    required: false
  }

  #swagger.parameters['take'] = {
    in: 'query',
    type: 'string',
    description: 'The number of users to fetch in one request. Defaults to a predefined batch size.',
    required: false
  }

   #swagger.parameters['query'] = {
    in: 'query',
    type: 'string',
    description: 'Optional search query to filter users by their name.',
    required: false
  }

  #swagger.responses[200] = {
    description: 'Friends fetched successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/GetFriendsResponse'
        },
        examples: {
          getFriendsResponse: {
            $ref: '#/components/examples/GetFriendsResponse'
          }
        }
      }
    }
  }
*/
);

userRouter.get(
  '/:id/friend-requests',
  verifyToken('accessToken'),
  getFriendRequests
  /*
  #swagger.summary = "Retrieves a paginated list of pending friend requests for a specific user."

  #swagger.description = "This endpoint retrieves a paginated list of pending friend requests for the current user. It supports searching by sender's name and cursor-based pagination to load more friend requests. The response includes details about the friend requests, pagination info, and ensures that users can only fetch their own friend requests."

  #swagger.parameters['id'] = {
    in: 'path',
    type: 'string',
    description: 'Unique MongoDB ID',
    required: true
  }

  #swagger.parameters['cursor'] = {
    in: 'query',
    type: 'string',
    description: 'Cursor for fetching the next page of results (i.e., the ID of the last user from the previous page).',
    required: false
  }

  #swagger.parameters['take'] = {
    in: 'query',
    type: 'string',
    description: 'The number of users to fetch in one request. Defaults to a predefined batch size.',
    required: false
  }

   #swagger.parameters['query'] = {
    in: 'query',
    type: 'string',
    description: 'Optional search query to filter users by their name.',
    required: false
  }


  #swagger.responses[200] = {
    description: 'Friends requests fetched successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/GetFriendRequestsResponse'
        },
        examples: {
          getFriendRequestsResponse: {
            $ref: '#/components/examples/GetFriendRequestsResponse'
          }
        }
      }
    }
  }

   #swagger.responses[403] = {
    description: "You can only fetch your own friend requests",
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

userRouter.post(
  '/:id/unfriend/:friendId',
  verifyToken('accessToken'),
  unfriendUser
  /*
  #swagger.summary = "Removes a friend relationship between two users."

  #swagger.description = "This endpoint removes the friendship between two users. It ensures the user is attempting to unfriend their own friend and verifies that both users exist. If the users are friends, the friendship is removed, and any pending friend requests between them are deleted. The response confirms the success of the operation."

  #swagger.parameters['id'] = {
    in: 'path',
    type: 'string',
    description: 'Unique MongoDB ID',
    required: true
  }

  #swagger.parameters['friendId'] = {
    in: 'path',
    type: 'string',
    description: 'Unique MongoDB ID',
    required: true
  }

  #swagger.responses[200] = {
    description: 'Friend removed successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/UnfriendUserResponse'
        },
        examples: {
          unfriendUserResponse: {
            $ref: '#/components/examples/UnfriendUserResponse'
          }
        }
      }
    }
  }

  #swagger.responses[403] = {
    description: "You can only unfriend your friends",
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

userRouter.get(
  '/:id/suggested-friends',
  verifyToken('accessToken'),
  getSuggestedFriends
  /*
  #swagger.summary = "Retrieves a paginated list of suggested friends for a specific user."

  #swagger.description = "This endpoint retrieves a paginated list of suggested friends for the specified user. Suggested friends are individuals who are friends of the user's friends but are not yet friends with the user. The request supports pagination using cursor-based pagination, and the response includes suggested friends data and pagination information."

  #swagger.parameters['id'] = {
    in: 'path',
    type: 'string',
    description: 'Unique MongoDB ID',
    required: true
  }

  #swagger.parameters['cursor'] = {
    in: 'query',
    type: 'string',
    description: 'Cursor for fetching the next page of results (i.e., the ID of the last user from the previous page).',
    required: false
  }

  #swagger.parameters['take'] = {
    in: 'query',
    type: 'string',
    description: 'The number of users to fetch in one request. Defaults to a predefined batch size.',
    required: false
  }

  #swagger.parameters['query'] = {
    in: 'query',
    type: 'string',
    description: 'Optional search query to filter users by their name.',
    required: false
  }

  #swagger.responses[200] = {
    description: 'Suggested friends fetched successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/GetSuggestedFriendsResponse'
        },
        examples: {
          getSuggestedFriends: {
            $ref: '#/components/examples/GetSuggestedFriendsResponse'
          }
        }
      }
    }
  }

   #swagger.responses[403] = {
    description: "You can only fetch your suggested friends",
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

userRouter.get(
  '/:id/mutual-friends/:otherUserId',
  verifyToken('accessToken'),
  getMutualFriends
  /*
  #swagger.summary = "Retrieves a paginated list of mutual friends between the current user and another user."

  #swagger.description = "This endpoint retrieves a paginated list of mutual friends between the current user and another specified user. Mutual friends are defined as users who are friends with both the current user and the specified user. The response includes pagination details to facilitate efficient data retrieval."

  #swagger.parameters['id'] = {
    in: 'path',
    type: 'string',
    description: 'Unique MongoDB ID',
    required: true
  }

  #swagger.parameters['cursor'] = {
    in: 'query',
    type: 'string',
    description: 'Cursor for fetching the next page of results (i.e., the ID of the last user from the previous page).',
    required: false
  }

  #swagger.parameters['take'] = {
    in: 'query',
    type: 'string',
    description: 'The number of users to fetch in one request. Defaults to a predefined batch size.',
    required: false
  }

  #swagger.parameters['query'] = {
    in: 'query',
    type: 'string',
    description: 'Optional search query to filter users by their name.',
    required: false
  }

  #swagger.responses[200] = {
    description: 'Mutual friends fetched successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/GetMutualFriendsResponse'
        },
        examples: {
          getMutualFriends: {
            $ref: '#/components/examples/GetMutualFriendsResponse'
          }
        }
      }
    }
  }

  #swagger.responses[403] = {
    description: "You can only fetch your mutual friends",
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

userRouter.get(
  '/:id/friendship-status/:otherUserId',
  verifyToken('accessToken'),
  getFriendshipStatus
  /*
  #swagger.summary = "Retrieves the friendship status between the current user and another user."

  #swagger.description = "This endpoint retrieves the friendship status between the current user and another specified user. It verifies that the request is for the current user's own friendship status and checks whether they are friends, have a pending friend request, or are not friends at all. The response includes the friendship status and a success message."

  #swagger.parameters['id'] = {
    in: 'path',
    type: 'string',
    description: 'Unique MongoDB ID',
    required: true
  }

  #swagger.parameters['otherUserId'] = {
    in: 'path',
    type: 'string',
    description: 'Unique MongoDB ID',
    required: true
  }

  #swagger.responses[200] = {
    description: 'Mutual friends fetched successfully',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/GetFriendshipStatusResponse'
        },
        examples: {
          getFriendshipStatus: {
            $ref: '#/components/examples/GetFriendshipStatusResponse'
          }
        }
      }
    }
  }

   #swagger.responses[403] = {
    description: "You can only check your own friendship status",
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

export default userRouter;
