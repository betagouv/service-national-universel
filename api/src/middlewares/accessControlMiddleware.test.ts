import { NextFunction, Response } from "express";
import { ERRORS, isSuperAdmin, ROLES } from "snu-lib";
import { UserRequest } from "../controllers/request";
import { accessControlMiddleware } from "./accessControlMiddleware";

jest.mock("snu-lib", () => ({
  ...jest.requireActual("snu-lib"),
  isSuperAdmin: jest.fn(),
}));

describe("accessControlMiddleware", () => {
  let req: UserRequest;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      user: {},
    } as UserRequest;
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    next = jest.fn();
    (isSuperAdmin as jest.Mock).mockReturnValue(false);
  });

  it("should call next if user role is allowed", () => {
    req.user.role = ROLES.ADMIN;
    const middleware = accessControlMiddleware([ROLES.ADMIN]);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it("should call next if user is a super admin", () => {
    (isSuperAdmin as jest.Mock).mockReturnValue(true);

    const middleware = accessControlMiddleware([ROLES.REFERENT_CLASSE]);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it("should return 403 if user role is not allowed", () => {
    req.user.role = ROLES.VISITOR;

    const middleware = accessControlMiddleware([ROLES.ADMIN]);

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
  });

  it("should return 403 if user role is not allowed and isSuperAdmin returns false", () => {
    req.user.role = ROLES.VISITOR;

    const middleware = accessControlMiddleware([ROLES.ADMIN]);

    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
  });
});
