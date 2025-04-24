import { Response, NextFunction } from "express";
import { ERRORS, HasPermissionsParams, isAuthorized, PERMISSION_ACTIONS } from "snu-lib";
import { UserRequest } from "../controllers/request";

export function permissionAccesControlMiddleware({ codes, action = PERMISSION_ACTIONS.READ }: Omit<HasPermissionsParams, "user">) {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!codes.some((code) => isAuthorized({ user, code, action }))) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    return next();
  };
}
