import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";
export const authMiddleware = (strategy: string) => (req: Request, res: Response, next: NextFunction) => {
  if (isPublicRoute(req.path)) {
    //@ts-expect-error ipInfo does not exist
    logger.info(`Acessing public route: ${req.originalUrl} - ip: ${req.ipInfo}`);
    return next();
  }
  return passport.authenticate(strategy, { session: false, failWithError: true })(req, res, next);
};

export function isPublicRoute(path: string): boolean {
  const publicRoutes = ["/public"];
  return publicRoutes.some((route) => path.startsWith(route));
}
