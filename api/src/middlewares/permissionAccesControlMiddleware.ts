import { Response, NextFunction } from "express";
import { ERRORS, HasPermissionsParams, isAuthorized } from "snu-lib";
import { UserRequest } from "../controllers/request";

export function permissionAccesControlMiddleware(permissions: HasPermissionsParams["permissions"]) {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!permissions.some(({ ressource, action }) => isAuthorized({ user, ressource, action }))) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    return next();
  };
}
