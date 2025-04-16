import { Response, NextFunction } from "express";
import { ERRORS, isAuthorized, PERMISSION_CODES } from "snu-lib";
import { UserRequest } from "../controllers/request";

export function permissionAccesControlMiddleware(allowedPermissions: (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES][]) {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!allowedPermissions.some((permission) => isAuthorized({ user, code: permission }))) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    return next();
  };
}
