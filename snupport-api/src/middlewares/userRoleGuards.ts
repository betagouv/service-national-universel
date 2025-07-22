import { Request, Response, NextFunction } from 'express';
import { ERRORS } from '../errors';

export const requireRole = (role: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user.role !== role) {
            return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
        }
        next();
    };
}
