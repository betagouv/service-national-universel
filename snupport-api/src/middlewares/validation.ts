import { Request, Response, NextFunction } from 'express';
import Joi, { ValidationError, Schema } from 'joi';
import { ERRORS } from '../errors';
import { SCHEMA_ID } from '../schemas';

export const validationErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ValidationError) {
    return res.status(400).json({
      ok: false,
      code: ERRORS.VALIDATION_ERROR,
      error: error.toString(),
    });
  }

  return next(error);
};

const _options = {
  abortEarly: false,
}

export const idSchema = Joi.object({
  id: SCHEMA_ID.required(),
});

export const validateBody = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, _options);

    if (error) {
      next(error);
      return;
    }

    req.cleanBody = value;
    next();
  };
};

export const validateParams = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, _options);

    if (error) {
      next(error);
      return;
    }

    req.cleanParams = value;
    next();
  };
};

export const validateQuery = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, _options);

    if (error) {
      next(error);
      return;
    }

    req.cleanQuery = value;
    next();
  };
};