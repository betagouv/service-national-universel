import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";
export const authMiddleware = (strategy: string | string[]) => (req: Request, res: Response, next: NextFunction) => {
  if (isPublicRoute(req.path)) {
    // PL6 : req.ip (Express, fiable grâce à `trust proxy`), jamais req.ipInfo (request-ip),
    // falsifiable via X-Client-IP / X-Forwarded-For sans validation de la chaîne de proxies.
    logger.info(`Acessing public route: ${req.originalUrl} - ip: ${req.ip}`);
    return next();
  }
  return passport.authenticate(strategy, { session: false, failWithError: true })(req, res, next);
};

export function isPublicRoute(path: string): boolean {
  const publicRoutes = ["/public"];
  return publicRoutes.some((route) => path.startsWith(route));
}
