import { Response, NextFunction } from "express";
import { ERRORS, UserDto } from "snu-lib";
import { UserRequest } from "../controllers/request";
import { permissionAccessControlMiddleware } from "./permissionAccessControlMiddleware";

describe("permissionAccessControlMiddleware", () => {
  let mockRequest: Partial<UserRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      user: {
        _id: "123",
        roles: ["admin"],
      } as UserDto,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it("should call next() when user has required permissions", () => {
    // Mock isAuthorized to return true
    jest.spyOn(require("snu-lib"), "isAuthorized").mockReturnValue(true);

    const middleware = permissionAccessControlMiddleware([{ resource: "user", action: "read" }]);

    middleware(mockRequest as UserRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it("should return 403 when user does not have required permissions", () => {
    // Mock isAuthorized to return false
    jest.spyOn(require("snu-lib"), "isAuthorized").mockReturnValue(false);

    const middleware = permissionAccessControlMiddleware([{ resource: "user", action: "write" }]);

    middleware(mockRequest as UserRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.send).toHaveBeenCalledWith({
      ok: false,
      code: ERRORS.OPERATION_UNAUTHORIZED,
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
