import { requestBodyValidator, requestParamsValidator, requestQueryValidator, requestValidatorMiddleware } from "./requestValidatorMiddleware";
import Joi from "joi";
import { ERRORS } from "../utils";
import { RouteRequest } from "../controllers/request";
import { Response } from "express";

describe("requestValidatorMiddleware", () => {
  describe("requestParamsValidator", () => {
    it("should validate the request params and return the validated params", () => {
      const validator = Joi.object({
        id: Joi.string().required(),
      });
      const params = {
        id: "123",
        unknownParam: "unknownParam",
      };

      const validatedParams = requestParamsValidator(validator, params);

      expect(validatedParams).toEqual({
        id: "123",
      });
    });

    it("should throw an error if the request params are invalid", () => {
      const validator = Joi.object({
        id: Joi.string().required(),
      });
      const params = { id: 1 };

      expect(() => requestParamsValidator(validator, params)).toThrow(ERRORS.INVALID_PARAMS);
    });
  });

  describe("requestQueryValidator", () => {
    it("should validate the request query and return the validated query", () => {
      const validator = Joi.object({
        page: Joi.number().integer().positive(),
        limit: Joi.number().integer().positive(),
      });
      const query = {
        page: "1",
        limit: "10",
        unknownQuery: "unknownQuery",
      };

      const validatedQuery = requestQueryValidator(validator, query);

      expect(validatedQuery).toEqual({
        page: 1,
        limit: 10,
      });
    });

    it("should throw an error if the request query is invalid", () => {
      const validator = Joi.object({
        page: Joi.number().integer().positive(),
        limit: Joi.number().integer().positive(),
      });
      const query = { page: "invalid", limit: "10" };

      expect(() => requestQueryValidator(validator, query)).toThrow(ERRORS.INVALID_QUERY);
    });
  });

  describe("requestBodyValidator", () => {
    it("should validate the request body and return the validated body", () => {
      const validator = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required().trim(),
      });
      const body = {
        name: "John Doe",
        email: " johndoe@example.com",
        unknownProperty: "unknownProperty",
      };

      const validatedBody = requestBodyValidator(validator, body);

      expect(validatedBody).toEqual({
        name: "John Doe",
        email: "johndoe@example.com",
      });
    });

    it("should throw an error if the request body is invalid", () => {
      const validator = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      });
      const body = {
        name: "John Doe",
        email: "invalid-email",
      };

      expect(() => requestBodyValidator(validator, body)).toThrow(ERRORS.INVALID_BODY);
    });
  });

  it("should validate the request params, query, and body and call next() if valid", () => {
    const validator = {
      params: Joi.object({
        id: Joi.string().required(),
      }),
      query: Joi.object({
        page: Joi.number().integer().positive(),
        limit: Joi.number().integer().positive(),
      }),
      body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required().trim(),
      }),
    };
    const req = {
      params: {
        id: "123",
        unknownParam: "unknownParam",
      },
      query: {
        page: "1",
        limit: "10",
        unknownQuery: "unknownQuery",
      },
      body: {
        name: "John Doe",
        email: " johndoe@example.com",
        unknownProperty: "unknownProperty",
      },
    } as unknown as RouteRequest<any>;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    requestValidatorMiddleware(validator)(req, res, next);

    expect(req.validatedParams).toEqual({
      id: "123",
    });
    expect(req.validatedQuery).toEqual({
      page: 1,
      limit: 10,
    });
    expect(req.validatedBody).toEqual({
      name: "John Doe",
      email: "johndoe@example.com",
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it("should return a 400 error if the request params, query, or body is invalid", () => {
    const validator = {
      params: Joi.object({
        id: Joi.string().required(),
      }),
      query: Joi.object({
        page: Joi.number().integer().positive(),
        limit: Joi.number().integer().positive(),
      }),
      body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
      }),
    };
    const req = {
      params: { id: 1 },
      query: { page: "invalid", limit: "10" },
      body: {
        name: "John Doe",
        email: "invalid-email",
      },
    } as unknown as RouteRequest<any>;
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    requestValidatorMiddleware(validator)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ ok: false, code: ERRORS.INVALID_PARAMS });
    expect(next).not.toHaveBeenCalled();
  });
  it("should return an empty validated body", () => {
    const validator = Joi.object({});
    const body = {};
    const validatedBody = requestBodyValidator(validator, body);
    expect(validatedBody).toEqual({});
  });
  it("should return an empty validated body when body is undefined", () => {
    const validator = undefined;
    const body = undefined;
    const validatedBody = requestBodyValidator(validator, body);
    expect(validatedBody).toEqual({});
  });
});
