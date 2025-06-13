import { Response, NextFunction } from "express";
import { ERRORS, HasPermissionsParams, isAuthorized } from "snu-lib";
import { UserRequest } from "../controllers/request";

export function permissionAccessControlMiddleware(permissions: HasPermissionsParams["permissions"]) {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!permissions.some(({ resource, action, ignorePolicy }) => isAuthorized({ user, resource, action, ignorePolicy }))) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    return next();
  };
}
