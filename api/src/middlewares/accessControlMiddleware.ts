import { Response, NextFunction } from "express";
import { ERRORS, isSuperAdmin, ROLES } from "snu-lib";
import { UserRequest } from "../controllers/request";

export function accessControlMiddleware(allowedRoles: (typeof ROLES)[keyof typeof ROLES][]) {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!(allowedRoles?.includes(user?.role) || isSuperAdmin(user))) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    return next();
  };
}
