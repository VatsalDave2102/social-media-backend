// Defining reusable schemas
const User = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    bio: { type: 'string' },
    profilePicture: { type: 'string' }
  }
};

const OneOnOneChatUser = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    profilePicture: { type: 'string' },
    isDeleted: { type: 'boolean' }
  }
};

const MessageSender = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    isDeleted: { type: 'boolean' }
  }
};

const Message = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      content: { type: 'string' },
      senderId: { type: 'string' },
      oneOnOneChatId: { type: 'string' },
      groupChatId: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      isDeleted: { type: 'boolean' },
      sender: MessageSender
    }
  }
};

const FriendsManagementUser = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    profilePicture: { type: 'string' }
  }
};

const Pagination = {
  type: 'object',
  properties: {
    totalCount: { type: 'number' },
    hasNextPage: { type: 'boolean' },
    nextCursor: { type: 'string' }
  }
};

// Swagger schemas for user management APIs
export const userSchemas = {
  GetUsersResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        properties: {
          users: {
            type: 'array',
            items: User
          },
          pagination: Pagination
        }
      }
    }
  },
  GetUserChatsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        properties: {
          chats: {
            type: 'array',
            items: {
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    initiatorId: { type: 'string' },
                    participantId: { type: 'string' },
                    vanishMode: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    lastMessageAt: { type: 'string', format: 'date-time' },
                    // deletedForInitiator: {type: 'boolean' }
                    // deletedForParticipant: {type: 'boolean'}
                    initiator: OneOnOneChatUser,
                    participant: OneOnOneChatUser,
                    messages: Message,
                    chatType: { type: 'string' },
                    name: { type: 'string' }
                  }
                },
                {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    ownerId: { type: 'string' },
                    groupDescription: { type: 'string' },
                    groupIcon: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    lastMessageAt: { type: 'string', format: 'date-time' },
                    memberIds: {
                      type: 'array',
                      items: { type: 'string' }
                    },
                    messages: Message,
                    chatType: { type: 'string' }
                  }
                }
              ]
            }
          },
          friendsWithNoChats: {
            type: 'array',
            items: User
          },
          pagination: Pagination
        }
      }
    }
  },
  GetUserResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          bio: { type: 'string' },
          profilePicture: { type: 'string' },
          friendIds: {
            type: 'array',
            item: {
              type: 'string'
            }
          },
          friendOfIds: {
            type: 'array',
            item: {
              type: 'string'
            }
          },
          memberOfGroupIds: {
            type: 'array',
            item: {
              type: 'string'
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  UpdateUserRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: "User's full name",
        example: ''
      },
      bio: {
        type: 'string',
        description: "User's bio",
        example: ''
      },
      profilePicture: {
        type: 'string',
        format: 'binary',
        description: ''
      }
    }
  },
  UpdateUserResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          bio: { type: 'string' },
          profilePicture: { type: 'string' },
          friendIds: {
            type: 'array',
            item: {
              type: 'string'
            }
          },
          friendOfIds: {
            type: 'array',
            item: {
              type: 'string'
            }
          },
          memberOfGroupIds: {
            type: 'array',
            item: {
              type: 'string'
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  DeleteUserResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: { type: 'object', nullable: true }
    }
  },
  ChangePasswordRequest: {
    type: 'object',
    properties: {
      oldPassword: {
        type: 'string',
        description: "User's old password",
        example: ''
      },
      newPassword: {
        type: 'string',
        description: "User's new password",
        example: ''
      }
    }
  },
  ChangePasswordResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: { type: 'object', nullable: true }
    }
  },
  GetFriendsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          friends: {
            type: 'array',
            items: FriendsManagementUser
          },
          pagination: Pagination
        }
      }
    }
  },
  GetFriendRequestsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          friendsRequests: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                senderId: { type: 'string' },
                receiverId: { type: 'string' },
                status: {
                  type: 'string',
                  enum: ['PENDING', 'ACCEPTED', 'REJECTED']
                },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          },
          pagination: Pagination
        }
      }
    }
  },
  UnfriendUserResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: { type: 'object', nullable: true }
    }
  },
  GetSuggestedFriendsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          suggestedFriends: {
            type: 'array',
            items: FriendsManagementUser
          },
          pagination: Pagination
        }
      }
    }
  },
  GetMututalFriendsResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          mutualFriends: {
            type: 'array',
            items: FriendsManagementUser
          },
          pagination: Pagination
        }
      }
    }
  },
  GetFriendshipStatusResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: {
            type: 'string',
            enum: ['FRIENDS', 'REQUEST_SENT', 'REQUEST_RECEIVED', 'NOT_FRIENDS']
          }
        }
      }
    }
  }
};
