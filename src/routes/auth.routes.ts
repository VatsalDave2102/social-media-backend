import express from 'express';

import {
  forgotPassword,
  login,
  logout,
  refreshToken,
  register,
  resetPassword
} from '../controllers/auth.controllers';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  userLoginSchema,
  userRegistrationSchema
} from '../schemas/auth.schemas';
import upload from '../middlewares/multer';
import validateRequest from '../middlewares/validateRequest';
import verifyToken from '../middlewares/verifyToken';

const authRouter = express.Router();

authRouter.post(
  /* 
  #swagger.tags = ['Auth']

  #swagger.summary = 'Register a new user'

  #swagger.description = 
  'Registers a new user and returns an access token. 
  This endpoint allows new users to create an account by providing necessary information.
  Upon successful registration, it creates a new user account and returns an access token 
  that can be used for subsequent authenticated requests.'

  #swagger.requestBody = {
    required: true,
    content: {
      'multipart/form-data': {
        schema:{
          $ref: '#/components/schemas/RegistrationRequest'
        }
      }
    }
  } 

  #swagger.responses[201] = {
    description: 'User successfully registered',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/RegistrationResponse'
        },
        examples: {
          registrationResponse: {
            $ref: "#/components/examples/RegistrationResponse"
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
  '/register',
  upload.single('profilePicture'),
  validateRequest(userRegistrationSchema),
  register
);

authRouter.post(
  /* 
  #swagger.tags = ['Auth']

  #swagger.summary = 'Login a user'

  #swagger.description = 'Authenticates a user and returns a token. 
  This endpoint allows users to log in by providing their credentials (typically email and password). 
  Upon successful authentication, it returns a token that can be used for subsequent authenticated requests.'

  #swagger.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema:{
          $ref: '#/components/schemas/LoginRequest'
        }
      }
    }
  } 

  #swagger.responses[200] = {
    description: 'Login Successful',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/LoginResponse'
        },
        examples: {
          loginResponse: {
            $ref: "#/components/examples/LoginResponse"
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
  '/login',
  validateRequest(userLoginSchema),
  login
);

authRouter.post(
  /* 
  #swagger.tags = ['Auth']

  #swagger.summary = 'Logout a user'

  #swagger.description = 'Logs out the current user. 
  This endpoint invalidates the user's access token, effectively ending the user's session. 
  Also clears the refresh token cookie, ensuring that the user must log in again to access the app.'

  #swagger.security = [{
   "bearerAuth": []
  }] 

  #swagger.responses[200] = {
    description: 'Logout Successful',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/LogoutResponse'
        },
        examples: {
          logoutResponse: {
            $ref: "#/components/examples/LogoutResponse"
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
  '/logout',
  verifyToken('accessToken'),
  logout
);

authRouter.post(
  /* 
  #swagger.tags = ['Auth'] 

  #swagger.summary = 'Refresh access token' 

  #swagger.description = 'Generate a new access token using a valid refresh token. 
  The refresh token must be provided in the Authorization header.' 

  #swagger.security = [{
   "bearerAuth": []
  }] 

  #swagger.responses[200] = {
    description: 'Access token refreshed successfully',
    content:{
      "application/json":{
        schema: {
          $ref: '#/components/schemas/RefreshTokenResponse'
        },
        examples: {
          refreshTokenResponse: {
            $ref: "#/components/examples/RefreshTokenResponse"
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
  '/refresh-token',
  verifyToken('refreshToken'),
  refreshToken
);

authRouter.post(
  /* 
  #swagger.tags = ['Auth'] 

  #swagger.summary = 'Forgot Password' 

  #swagger.description = 'Sends a link to the user\'s email address to reset their password. 
  The link will have the reset password JWT in the query params & will expire in 15 minutes. 
  If the user does not click on the link within 15 minutes, 
  the link will expire and the user will need to request a new password reset.'

  #swagger.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema:{
          $ref: '#/components/schemas/ForgotPasswordRequest'
        }
      }
    }
  } 

  #swagger.responses[200] = {
    description: 'Reset password email sent successfully',
    content:{
      "application/json":{
        schema: {
          $ref: '#/components/schemas/ForgotPasswordResponse'
        },
        examples: {
          refreshTokenResponse: {
            $ref: "#/components/examples/ForgotPasswordResponse"
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
  '/forgot-password',
  validateRequest(forgotPasswordSchema),
  forgotPassword
);

authRouter.post(
  /* 
  #swagger.tags = ['Auth'] 

  #swagger.summary = 'Reset Password' 

  #swagger.description = 'Resets the user\'s password using a valid reset password token. 
  The reset password token must be provided in the query string.'

  #swagger.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema:{
          $ref: '#/components/schemas/ResetPasswordRequest'
        }
      }
    }
  } 

  #swagger.responses[200] = {
    description: 'Reset password email sent successfully',
    content:{
      "application/json":{
        schema: {
          $ref: '#/components/schemas/ResetPasswordResponse'
        },
        examples: {
          resetPasswordResponse: {
            $ref: "#/components/examples/ResetPasswordResponse"
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
  '/reset-password',
  validateRequest(resetPasswordSchema),
  resetPassword
);

export default authRouter;
