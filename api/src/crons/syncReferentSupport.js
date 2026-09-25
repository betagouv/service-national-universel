const { ReferentModel } = require("../models");
const SNUpport = require("../SNUpport");
const { capture, captureMessage } = require("../sentry");
const slack = require("../slack");
const { ROLES, ReferentStatus } = require("snu-lib");

const SUPPORT_REFERENT_ROLES = [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION];
// Seuls les référents départementaux et régionaux actifs ont un compte support. Un statut absent
// (documents antérieurs au champ) vaut ACTIVE.
const SUPPORT_REFERENT_QUERY = { role: { $in: SUPPORT_REFERENT_ROLES }, status: { $ne: ReferentStatus.INACTIVE } };

const reportFailure = (title, response) => {
  captureMessage(title, { extra: { code: response.code } });
  slack.error({ title, text: JSON.stringify(response.code) });
};

// Crée ou met à jour les comptes support des référents modifiés dans les dernières 24 h.
const syncUpdatedReferents = async () => {
  let referents = await ReferentModel.find(
    { ...SUPPORT_REFERENT_QUERY, updatedAt: { $gte: new Date(new Date() - 24 * 60 * 60 * 1000) } },
    "email firstName lastName department region role -lastLogoutAt -passwordChangedAt",
  ).lean();
  referents = referents.map((i) => {
    const { _id, department, ...rest } = i;
    return {
      ...rest,
      id: _id.toString(),
      departments: department,
    };
  });
  const response = await SNUpport.api(`/v0/referent`, { method: "POST", credentials: "include", body: JSON.stringify({ referents }) });
  if (!response.ok) reportFailure("Fail sync referent to SNUpport", response);
};

// Révoque le compte support de tout référent qui n'y est plus habilité : rôle changé, statut inactif,
// ou suppression dont l'appel DELETE /v0/referent aurait échoué (GOO-13). La liste envoyée est
// complète, pas limitée aux dernières 24 h, pour rattraper aussi les changements plus anciens.
const revokeFormerReferents = async () => {
  const activeReferents = await ReferentModel.find(SUPPORT_REFERENT_QUERY, "_id").lean();
  // Sans aucun référent habilité, la réconciliation révoquerait tout le monde : on s'abstient.
  if (!activeReferents.length) {
    captureMessage("Revoke referents on SNUpport skipped: no active referent");
    return;
  }
  const activeReferentIds = activeReferents.map((referent) => referent._id.toString());
  const response = await SNUpport.api(`/v0/referent/reconcile`, { method: "POST", credentials: "include", body: JSON.stringify({ activeReferentIds }) });
  if (!response.ok) return reportFailure("Fail revoke referents on SNUpport", response);
  const revoked = response.data?.revokedReferentIds || [];
  if (revoked.length) slack.info({ title: "Comptes support révoqués", text: `Référents qui ne sont plus habilités : ${revoked.join(", ")}` });
};

exports.handler = async () => {
  try {
    await syncUpdatedReferents();
    await revokeFormerReferents();
  } catch (e) {
    capture(e);
    throw e;
  }
};

exports.SUPPORT_REFERENT_QUERY = SUPPORT_REFERENT_QUERY;
