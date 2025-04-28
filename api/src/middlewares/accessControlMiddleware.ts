import { Response, NextFunction } from "express";
import { ERRORS, isSuperAdmin, ROLES, UserDto } from "snu-lib";
import { UserRequest, AuthInfo } from "../controllers/request";
import passport from "passport";

export function accessControlMiddleware(allowedRoles: (typeof ROLES)[keyof typeof ROLES][]) {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!(allowedRoles?.includes(user?.role) || isSuperAdmin(user))) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    return next();
  };
}

export const impersonationMiddleWare = (role: string) => {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    passport.authenticate(role, { session: false, failWithError: true }, (err: Error | null, user: UserDto, info?: AuthInfo) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.user = user;

      if (info && info.impersonatedUser) {
        req.impersonatedUser = info.impersonatedUser;
      }

      next();
    })(req, res, next);
  };
};
