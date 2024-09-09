import { AnyZodObject, ZodEffects } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const validateRequest = (schema: AnyZodObject | ZodEffects<AnyZodObject>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        data: null,
      });
    }
  };
};

export default validateRequest;
