import bodyParser from "body-parser";
import { Express, NextFunction, Request, Response } from "express";

import { logger } from "../logger";
import { errorCodeForStatus } from "../utils/errorCode";

// Les fichiers arrivent en multipart (express-fileupload, plafond par route) : aucun corps JSON légitime
// n'approche 1 Mo. À 50 Mo, n'importe quel anonyme faisait parser de gros corps à l'API (L30, audit du 21/09/2026).
export const BODY_SIZE_LIMIT = "1mb";

export function applyBodyParsers(app: Express) {
  app.use(bodyParser.json({ limit: BODY_SIZE_LIMIT }));
  app.use(bodyParser.text({ limit: BODY_SIZE_LIMIT, type: "application/x-ndjson" }));
  app.use(bodyParser.urlencoded({ limit: BODY_SIZE_LIMIT, extended: true }));
}

// Le client ne reçoit qu'un code stable : le message et le nom de l'erreur (Mongo, Joi, body-parser…) décrivent
// l'implémentation (L7, audit du 21/09/2026). Le détail reste dans Sentry (setupExpressErrorHandler) et les logs.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function handleError(err: any, req: Request, res: Response, _next: NextFunction) {
  const status = Number(err?.status || err?.statusCode) || 500;
  if (status >= 500) logger.error(`Unhandled error on ${req.method} ${req.path}: ${err?.name}`);
  res.status(status).json({ ok: false, code: errorCodeForStatus(status) });
}
