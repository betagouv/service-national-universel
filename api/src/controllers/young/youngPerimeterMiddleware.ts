import { NextFunction, Response } from "express";
import passport from "passport";
import { UserDto, YoungType } from "snu-lib";

import { YoungModel, YoungDocument } from "../../models";
import { ERRORS, isYoung } from "../../utils";
import { capture } from "../../sentry";
import { validateId } from "../../utils/validator";
import { canEditYoungInScope } from "../../young/youngScope";
import { UserRequest } from "../request";

export interface YoungPerimeterRequest extends UserRequest {
  /** Volontaire ciblé par la route, chargé et contrôlé par `youngPerimeterMiddleware`. */
  targetYoung?: YoungDocument;
}

interface YoungPerimeterOptions {
  /** Nom du paramètre d'URL portant l'_id du volontaire (défaut : `id`). */
  paramName?: string;
  /**
   * Contrôle appliqué à un référent. Par défaut `canEditYoungInScope`, qui ajoute le rattachement
   * réel (session phase 1, classe / établissement) à la matrice de rôles de `canEditYoung`.
   */
  referentAccess?: (user: UserDto, young: YoungType) => boolean | Promise<boolean>;
}

/**
 * Contrôle d'appartenance commun aux sous-routeurs `/young/:id/*`.
 *
 * Les sous-routeurs (documents, phase1, phase2, équivalences, point de rassemblement, notes…)
 * s'authentifiaient sans jamais rapprocher `:id` de l'appelant : un jeune pouvait lire et écrire le
 * dossier d'un autre jeune, un référent celui de n'importe quel volontaire du pays (constats C15,
 * C18, H44 à H48, H50 à H54 de l'audit du 21/09/2026).
 *
 * Le middleware charge le volontaire une fois pour toutes et l'expose dans `req.targetYoung`, ce qui
 * évite aux handlers de le recharger.
 */
export function youngPerimeterMiddleware({ paramName = "id", referentAccess = canEditYoungInScope }: YoungPerimeterOptions = {}) {
  const authenticate = passport.authenticate(["young", "referent"], { session: false, failWithError: true });

  return [
    authenticate,
    async (req: YoungPerimeterRequest, res: Response, next: NextFunction) => {
      try {
        const { error, value: youngId } = validateId(req.params[paramName]);
        if (error) {
          capture(error);
          return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
        }

        const young = await YoungModel.findById(youngId);
        if (!young) return res.status(404).send({ ok: false, code: ERRORS.YOUNG_NOT_FOUND });

        // La stratégie passport de chaque route borne déjà l'appelant à `young` ou `referent`.
        if (isYoung(req.user)) {
          if (req.user._id.toString() !== young._id.toString()) {
            return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
          }
        } else if (!(await referentAccess(req.user, young as unknown as YoungType))) {
          return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
        }

        req.targetYoung = young;
        return next();
      } catch (err) {
        capture(err);
        return res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
      }
    },
  ];
}
