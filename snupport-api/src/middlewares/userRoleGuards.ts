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

// Le rôle DG consulte les tickets sans jamais les modifier : snupport-app grise ses actions, l'API
// doit les refuser aussi (FH11, GOO-13).
export const READ_ONLY_ROLES = ["DG"];

export const forbidReadOnlyRoles = (req: Request, res: Response, next: NextFunction) => {
    if (READ_ONLY_ROLES.includes(req.user.role)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }
    next();
};
