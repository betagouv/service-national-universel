import { FeatureFlagName, isAdminAccessAllowed } from "snu-lib";
import { FeatureFlagModel } from "../models";

/**
 * Verrouillage temporaire de l'accès référent (voir snu-lib `adminAccessRestriction`).
 * Relu à chaque appel : activer ou lever le verrouillage (script `adminAccessRestriction.effect.ts`)
 * prend effet immédiatement, sessions déjà ouvertes comprises.
 */
export const isReferentAccessAllowed = async (referentId: string, impersonatorId?: string | null): Promise<boolean> => {
  const flag = await FeatureFlagModel.findOne({ name: FeatureFlagName.ADMIN_ACCESS_RESTRICTED }).lean();
  return isAdminAccessAllowed(flag as any, { referentId: String(referentId), impersonatorId: impersonatorId ? String(impersonatorId) : null });
};
