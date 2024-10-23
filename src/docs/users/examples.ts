export const userExamples = {
  GetUsersResponse: {
    value: {
      success: true,
      message: 'Users fetched successfully!',
      data: {
        users: [
          {
            id: '60d725b8b0d7c911b2f28f0c',
            name: 'John Doe',
            email: 'john@example.com',
            bio: 'A short bio about me',
            profilePicture: 'https://example.com/profile.jpg'
          },
          {
            id: '60d725b8b0d7c911b2f28f0e',
            name: 'Jane Doe',
            email: 'Jane@example.com',
            bio: 'A short bio about me',
            profilePicture: 'https://example.com/profile.jpg'
          }
        ],
        pagination: {
          totalCount: 27,
          hasNextPage: true,
          nextCursor: '60d7...'
        }
      }
    }
  },
  GetUserChatsResponse: {
    value: {
      success: true,
      message: 'User chats fetched successfully!',
      data: {
        chats: [
          {
            id: '66d6cd74e5cb752390d88fab',
            initiatorId: '66b33a2d19b3564668300673',
            participantId: '66b30bbeaea1612592e8609b',
            vanishMode: false,
            createdAt: '2024-09-03T08:48:52.406Z',
            updatedAt: '2024-09-25T11:49:04.375Z',
            lastMessageAt: '2024-09-25T11:49:04.375Z',
            deletedForInitiator: null,
            deletedForParticipant: null,
            initiator: {
              id: '66b33a2d19b3564668300673',
              name: 'John doe',
              profilePicture:
                'https://res.cloudinary.com/du6x7e2oh/image/upload/v1723021868/profile_images/co9vn8qwkejwid9t6pkc.png',
              isDeleted: false
            },
            participant: {
              id: '66b30bbeaea1612592e8609b',
              name: 'Jane doe',
              profilePicture:
                'https://res.cloudinary.com/du6x7e2oh/image/upload/v1726131950/profile_image/esjwefpmvrchidqcg6yq.png',
              isDeleted: false
            },
            messages: [
              {
                id: '66f3f8b0e493af07d1fe4537',
                content: 'First messsage',
                senderId: '66b33a2d19b3564668300673',
                oneOnOneChatId: '66d6cd74e5cb752390d88fab',
                groupChatId: null,
                createdAt: '2024-09-25T11:49:04.375Z',
                updatedAt: '2024-09-25T11:55:18.398Z',
                isDeleted: false,
                sender: {
                  id: '66b33a2d19b3564668300673',
                  name: 'John doe',
                  isDeleted: false
                }
              }
            ],
            type: 'ONE_ON_ONE',
            name: 'Jane doe'
          },
          {
            id: '66f15453eda9647f5be80fc6',
            name: 'New Group',
            ownerId: '66b33a2d19b3564668300673',
            groupDescription: 'New Group Desc',
            groupIcon:
              'https://res.cloudinary.com/du6x7e2oh/image/upload/v1727159813/group_icons/e4tdoeazmmjejjocchou.jpg',
            createdAt: '2024-09-23T11:43:15.115Z',
            updatedAt: '2024-09-25T11:12:54.370Z',
            lastMessageAt: '2024-09-25T11:12:54.370Z',
            memberIds: [
              '66b30bbeaea1612592e8609b',
              '66b33a2d19b3564668300673',
              '66a738b1f96d2cc3bbc9ae8d',
              '66a738b1f96d2cc3bbc9ae8b',
              '66a738b1f96d2cc3bbc9ae8e'
            ],
            messages: [
              {
                id: '66f3f036e793e250468d5f66',
                content: 'Group message',
                senderId: '66b33a2d19b3564668300673',
                oneOnOneChatId: null,
                groupChatId: '66f15453eda9647f5be80fc6',
                createdAt: '2024-09-25T11:12:54.370Z',
                updatedAt: '2024-09-25T11:56:20.789Z',
                isDeleted: false,
                sender: {
                  id: '66b33a2d19b3564668300673',
                  name: 'John doe'
                }
              }
            ],
            type: 'GROUP'
          }
        ],
        friendsWithNoChats: [
          {
            id: '60d725b8b0d7c911b2f28f0c',
            name: 'John Doe',
            email: 'john@example.com',
            bio: 'A short bio about me',
            profilePicture: 'https://example.com/profile.jpg'
          },
          {
            id: '60d725b8b0d7c911b2f28f0e',
            name: 'Jane Doe',
            email: 'Jane@example.com',
            bio: 'A short bio about me',
            profilePicture: 'https://example.com/profile.jpg'
          }
        ],
        pagination: {
          totalCount: 27,
          hasNextPage: true,
          nextCursor: '60d7...'
        }
      }
    }
  },
  GetUserResponse: {
    value: {
      success: true,
      message: 'User fetched successfully',
      data: {
        id: '66b30bbeaea1612592e8609b',
        name: 'Jane doe',
        email: 'janedoe@gmail.com',
        bio: 'SDE @Google',
        profilePicture:
          'https://res.cloudinary.com/du6x7e2oh/image/upload/v1726131950/profile_image/esjwefpmvrchidqcg6yq.png',
        friendIds: ['66c58d3c09c4603fe4b47527', '66b33a2d19b3564668300673'],
        friendOfIds: ['66a738b1f96d2cc3bbc9ae8b', '66a738b1f96d2cc3bbc9ae8b'],
        memberOfGroupIds: [
          '66d6dfb72db9bac027f38c8e',
          '66f0f5a3745ce55176d20cd9',
          '66f0f5b3745ce55176d20cda',
          '66f0f5e539dc71410a14c916',
          '66f0f60fd5534b22f99189b8',
          '66f0f7429f2815ed89a33669',
          '66f15453eda9647f5be80fc6'
        ],
        updatedAt: '2024-09-23T12:40:42.525Z',
        createdAt: '2024-08-07T05:53:02.678Z'
      }
    }
  },
  UpdateUserResponse: {
    value: {
      success: true,
      message: 'User updated successfully',
      data: {
        id: '66b30bbeaea1612592e8609b',
        name: 'Jane doe',
        email: 'janedoe@gmail.com',
        bio: 'SDE @Google',
        profilePicture:
          'https://res.cloudinary.com/du6x7e2oh/image/upload/v1726131950/profile_image/esjwefpmvrchidqcg6yq.png',
        friendIds: ['66c58d3c09c4603fe4b47527', '66b33a2d19b3564668300673'],
        friendOfIds: ['66a738b1f96d2cc3bbc9ae8b', '66a738b1f96d2cc3bbc9ae8b'],
        memberOfGroupIds: [
          '66d6dfb72db9bac027f38c8e',
          '66f0f5a3745ce55176d20cd9',
          '66f0f5b3745ce55176d20cda',
          '66f0f5e539dc71410a14c916',
          '66f0f60fd5534b22f99189b8',
          '66f0f7429f2815ed89a33669',
          '66f15453eda9647f5be80fc6'
        ],
        updatedAt: '2024-09-23T12:40:42.525Z',
        createdAt: '2024-08-07T05:53:02.678Z'
      }
    }
  },
  DeleteUserResponse: {
    value: {
      success: true,
      message: 'User deleted successfully',
      data: null
    }
  },
  ChangePasswordResponse: {
    value: {
      success: true,
      message: 'Password changed successfully',
      data: null
    }
  },
  GetFriendsResponse: {
    value: {
      success: true,
      message: 'Friends fetched successfully',
      data: {
        friends: [
          {
            id: '66a738b1f96d2cc3bbc9ae8b',
            name: 'John Doe',
            email: 'johndoe@gmail.com',
            profilePicture: 'https://avatars.githubusercontent.com/u/8733371'
          },
          {
            id: '66b33a2d19b3564668300673',
            name: 'Jane Doe',
            email: 'janedoe@gmail.com',
            profilePicture:
              'https://res.cloudinary.com/du6x7e2oh/image/upload/v1723021868/profile_images/co9vn8qwkejwid9t6pkc.png'
          }
        ],
        pagination: {
          totalCount: 27,
          hasNextPage: true,
          nextCursor: '60d7...'
        }
      }
    }
  },
  GetFriendRequestsResponse: {
    success: true,
    message: 'Friend Request fetched successfully',
    data: {
      friendRequests: [
        {
          id: '66a738b1f96d2cc3bbc9ae8b',
          senderId: '66a738b1f96d2cc3bbc9ae8e',
          receiverId: '66a738b1f96d2cc3bbc9ae8g',
          status: 'PENDING',
          createdAt: '2024-09-25T11:49:04.375Z',
          updatedAt: '2024-09-25T11:49:04.375Z',
          sender: {
            id: '66a738b1f96d2cc3bbc9ae8a',
            name: 'John Doe',
            email: 'johndoe@gmail.com',
            profilePicture: 'https://avatars.githubusercontent.com/u/8733371'
          }
        },
        {
          id: '66a738b1f96d2cc3bbc9ae8k',
          senderId: '66a738b1f96d2cc3bbc9ae8h',
          receiverId: '66a738b1f96d2cc3bbc9ae8n',
          status: 'PENDING',
          createdAt: '2024-09-25T11:49:04.375Z',
          updatedAt: '2024-09-25T11:49:04.375Z',
          sender: {
            id: '66a738b1f96d2cc3bbc9ae8z',
            name: 'Jane Doe',
            email: 'janedoe@gmail.com',
            profilePicture: 'https://avatars.githubusercontent.com/u/8733371'
          }
        }
      ],
      pagination: {
        totalCount: 27,
        hasNextPage: true,
        nextCursor: '60d7...'
      }
    }
  },
  UnfriendUserResponse: {
    value: {
      success: true,
      message: 'Friend removed successfully',
      data: null
    }
  },
  GetSuggestedFriendsResponse: {
    value: {
      success: true,
      message: 'Suggested friends fetched successfully',
      data: {
        suggestedFriends: [
          {
            id: '66a738b1f96d2cc3bbc9ae8b',
            name: 'John Doe',
            email: 'johndoe@gmail.com',
            profilePicture: 'https://avatars.githubusercontent.com/u/8733371'
          },
          {
            id: '66b33a2d19b3564668300673',
            name: 'Jane Doe',
            email: 'janedoe@gmail.com',
            profilePicture:
              'https://res.cloudinary.com/du6x7e2oh/image/upload/v1723021868/profile_images/co9vn8qwkejwid9t6pkc.png'
          }
        ],
        pagination: {
          totalCount: 27,
          hasNextPage: true,
          nextCursor: '60d7...'
        }
      }
    }
  },
  GetMutualFriendsResponse: {
    value: {
      success: true,
      message: 'Mutual friends fetched successfully',
      data: {
        mutualFriends: [
          {
            id: '66a738b1f96d2cc3bbc9ae8b',
            name: 'John Doe',
            email: 'johndoe@gmail.com',
            profilePicture: 'https://avatars.githubusercontent.com/u/8733371'
          },
          {
            id: '66b33a2d19b3564668300673',
            name: 'Jane Doe',
            email: 'janedoe@gmail.com',
            profilePicture:
              'https://res.cloudinary.com/du6x7e2oh/image/upload/v1723021868/profile_images/co9vn8qwkejwid9t6pkc.png'
          }
        ],
        pagination: {
          totalCount: 27,
          hasNextPage: true,
          nextCursor: '60d7...'
        }
      }
    }
  },
  GetFriendshipStatusResponse: {
    value: {
      success: true,
      message: 'Friendship status fetched successfully',
      data: {
        id: '66a738b1f96d2cc3bbc9ae8b',
        status: 'FRIENDS'
      }
    }
  }
};
