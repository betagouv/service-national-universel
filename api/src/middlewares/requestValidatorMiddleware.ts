import { NextFunction, Response } from "express";
import Joi from "joi";
import { capture } from "../sentry";
import { ERRORS } from "../utils";
import { RouteRequest } from "../controllers/request";
import { logger } from "../logger";

export interface SchemaValidator {
  params?: Joi.AnySchema;
  body?: Joi.AnySchema;
  query?: Joi.AnySchema;
}

export function requestValidatorMiddleware(validator: SchemaValidator) {
  return (req: RouteRequest<any>, res: Response, next: NextFunction) => {
    try {
      req.validatedParams = requestParamsValidator(validator.params, req.params);
      req.validatedQuery = requestQueryValidator(validator.query, req.query);
      req.validatedBody = requestBodyValidator(validator.body, req.body);
    } catch (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: error.message });
    }
    return next();
  };
}

export function requestParamsValidator<T>(validator: Joi.AnySchema<T> | undefined, params: any | undefined) {
  if (params && validator) {
    const { error, value } = validator.validate(params, { stripUnknown: true });
    if (error) {
      throw new Error(ERRORS.INVALID_PARAMS);
    }
    return value;
  }
  return {};
}

export function requestQueryValidator<T>(validator: Joi.AnySchema<T> | undefined, query: any | undefined) {
  if (query && validator) {
    const { error, value } = validator.validate(query, { stripUnknown: true });
    if (error) {
      throw new Error(ERRORS.INVALID_QUERY);
    }
    return value;
  }
  return {};
}

export function requestBodyValidator<T>(validator: Joi.AnySchema<T> | undefined, body: any | undefined) {
  if (body && validator) {
    const { error, value } = validator.validate(body, { stripUnknown: true });
    if (error) {
      logger.debug(error);
      throw new Error(ERRORS.INVALID_BODY);
    }
    return value;
  }
  return {};
}
