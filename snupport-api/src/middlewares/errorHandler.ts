import { Request, Response, NextFunction } from 'express';
import { capture } from "../sentry";
import { ERRORS } from "../errors";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  capture(error);

  res.status(500).json({
    ok: false,
    code: ERRORS.SERVER_ERROR,
  });
};
