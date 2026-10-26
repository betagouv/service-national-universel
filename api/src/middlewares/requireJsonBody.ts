import { NextFunction, Request, Response } from "express";
import { ERRORS } from "snu-lib";

// Un formulaire HTML ne peut envoyer que du urlencoded, du multipart ou du text/plain, sans
// requête préalable (preflight) : ce sont les seuls corps qu'une page d'un autre site peut poster.
// Exiger du JSON sur les routes qui posent une session ferme donc le login CSRF, qui
// connectait la victime au compte de l'attaquant (FM2, audit des fronts du 23/09/2026).
export const requireJsonBody = (req: Request, res: Response, next: NextFunction) => {
  if (!req.is("application/json")) {
    return res.status(415).send({ ok: false, code: ERRORS.UNSUPPORTED_TYPE });
  }
  next();
};
