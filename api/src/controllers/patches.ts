import Joi from "joi";
import mongoose, { Model } from "mongoose";

import { isReadAuthorized, PERMISSION_ACTIONS, PERMISSION_RESOURCES, RouteResponseBody, UserDto } from "snu-lib";

import { capture } from "../sentry";
import { ERRORS } from "../utils";
import { isSensitiveKey } from "../utils/logRedaction";
import { validateId } from "../utils/validator";
import { ClasseModel } from "../models";
import { RouteRequest, UserRequest } from "./request";

/**
 * Un historique ne doit jamais rendre un secret lisible. Les plugins `patchHistory` excluent les champs
 * d'authentification à l'écriture (`excludes`), mais les patches écrits avant l'ajout d'une exclusion
 * portent encore la valeur en clair (jetons parents, validation d'email, réinitialisation…).
 *
 * Filet générique appliqué à la lecture, quel que soit le modèle : toute opération dont un segment de
 * chemin porte un nom de secret (`isSensitiveKey`) est retirée, et les patches qui n'ont plus d'opération
 * disparaissent de l'historique.
 */
export const stripSensitiveOps = <T extends { ops?: { path?: string }[] }>(patches: T[]): T[] => {
  const kept: T[] = [];
  for (const patch of patches) {
    patch.ops = (patch.ops || []).filter(
      (op) =>
        !String(op.path)
          .split("/")
          .some((segment) => isSensitiveKey(segment)),
    );
    if (patch.ops.length > 0) kept.push(patch);
  }
  return kept;
};

/**
 * Historique d'un document. `preloaded` permet de réutiliser un document déjà chargé par l'appelant
 * (par exemple pour un contrôle de périmètre) au lieu de le relire en base.
 */
export const get = async (req: Partial<RouteRequest<any>> | UserRequest, model: Model<any>, preloaded?: any): Promise<any[]> => {
  try {
    const { error, value } = Joi.object({ id: Joi.string().required() })
      .unknown()
      .validate({ ...req.params }, { stripUnknown: true });
    if (error) {
      capture(error);
      throw new Error(ERRORS.INVALID_PARAMS);
    }

    if (
      !isReadAuthorized({ resource: PERMISSION_RESOURCES.USER_HISTORY, action: PERMISSION_ACTIONS.READ, user: req.user!, ignorePolicy: true }) &&
      !isReadAuthorized({ resource: PERMISSION_RESOURCES.PATCH, action: PERMISSION_ACTIONS.READ, user: req.user!, ignorePolicy: true })
    ) {
      throw new Error(ERRORS.OPERATION_UNAUTHORIZED);
    }

    const elem = preloaded && String(preloaded._id) === String(value.id) ? preloaded : await model.findById(value.id);
    if (!elem) throw new Error(ERRORS.NOT_FOUND);

    const data = await elem.patches.find({ ref: elem.id }).sort("-date").lean();
    //sometime we create an object with a field null, we don't want to send it
    data.forEach((patch) => {
      patch.ops = patch.ops.filter((op) => {
        const isAddOperation = op.op === "add";
        const hasValue = op.value !== null && op.value !== undefined && op.value !== "";
        const isNotEmptyArray = !Array.isArray(op.value) || op.value.length > 0;
        return !(isAddOperation && (!hasValue || !isNotEmptyArray));
      });
    });
    return stripSensitiveOps(data);
  } catch (error) {
    capture(error);
    throw error;
  }
};

interface GetOldStudentPatchesParams {
  classeId: string;
  user: UserDto;
}

export const getOldStudentPatches = async ({ classeId, user }: GetOldStudentPatchesParams): Promise<any[]> => {
  try {
    const { error, value: id } = validateId(classeId);
    if (error) {
      capture(error);
      throw new Error(ERRORS.INVALID_PARAMS);
    }
    if (
      !isReadAuthorized({ resource: PERMISSION_RESOURCES.USER_HISTORY, action: PERMISSION_ACTIONS.READ, user, ignorePolicy: true }) &&
      !isReadAuthorized({ resource: PERMISSION_RESOURCES.PATCH, action: PERMISSION_ACTIONS.READ, user, ignorePolicy: true })
    ) {
      throw new Error(ERRORS.OPERATION_UNAUTHORIZED);
    }

    const elem = await ClasseModel.findById(id);
    if (!elem) throw new Error(ERRORS.NOT_FOUND);

    const db = mongoose.connection.db;
    //here we search for students who leave the classe
    const data = await db
      .collection("young_patches")
      .aggregate([
        {
          $match: {
            ops: {
              $elemMatch: {
                path: "/classeId",
                op: { $ne: "add" },
                originalValue: id,
              },
            },
          },
        },
        {
          $sort: { date: -1 },
        },
      ])
      .toArray();

    return stripSensitiveOps(data);
  } catch (error) {
    capture(error);
    throw error;
  }
};

interface DeletePatchesParams {
  id: string;
  model: Model<any>;
}

export const deletePatches = async ({ id, model }: DeletePatchesParams): Promise<RouteResponseBody<any> & { codeError?: number }> => {
  try {
    const { error, value: validatedId } = validateId(id);
    if (error) {
      capture(error);
    }
    if (error) return { ok: false, code: ERRORS.INVALID_PARAMS, codeError: 400 };

    const elem = await model.findById(validatedId);
    if (!elem) return { ok: false, code: ERRORS.NOT_FOUND, codeError: 404 };

    const fieldToKeep = [
      "status",
      "birthdateAt",
      "cohort",
      "gender",
      "situation",
      "grade",
      "qpv",
      "populationDensity",
      "handicap",
      "ppsBeneficiary",
      "paiBeneficiary",
      "highSkilledActivity",
      "statusPhase1",
      "statusPhase2",
      "phase2ApplicationStatus",
      "statusPhase3",
      "department",
      "region",
      "zip",
      "city",
    ];

    const data = await elem.patches.find({ ref: elem.id });
    for (const patch of data) {
      let updatedOps = patch.ops.filter((op) => {
        if (fieldToKeep.find((val) => val === op.path.split("/")[1])) {
          return true;
        } else {
          return false;
        }
      });

      if (updatedOps.length === 0) {
        await patch.deleteOne();
      } else {
        patch.set({ ops: updatedOps });
        if (patch.user !== undefined && patch.user["role"] === undefined) {
          patch.set({ user: undefined });
        }
        await patch.save();
      }
    }

    return { ok: true };
  } catch (error) {
    capture(error);
    return { ok: false, code: ERRORS.SERVER_ERROR };
  }
};

export default { get, getOldStudentPatches, deletePatches, stripSensitiveOps };
