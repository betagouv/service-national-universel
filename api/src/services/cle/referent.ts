import { CleEtablissementModel, ReferentModel } from "../../models";
import { EtablissementDocument } from "../../models/cle/etablissementType";
import { ROLES } from "snu-lib";
import { randomUUID } from "node:crypto";
import { ReferentDocument } from "../../models/referentType";
const crypto = require("crypto");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { ERRORS } = require("../../utils");
const { sendTemplate } = require("../../sendinblue");
const config = require("config");
const { inSevenDays } = require("../../utils");
const { capture } = require("../../sentry");

export const findOrCreateReferent = async (referent, { etablissement, role, subRole }) => {
  try {
    // Return if already exists
    if (referent._id) return referent;

    // Create referent
    if (!referent.email || !referent.firstName || !referent.lastName) throw new Error("Missing referent email or firstName or lastName");
    const invitationToken = crypto.randomBytes(20).toString("hex");
    referent = await ReferentModel.create({
      ...referent,
      role,
      subRole,
      invitationToken,
      invitationExpires: inSevenDays(),
      department: etablissement.department,
      region: etablissement.region,
    });

    return referent;
  } catch (error) {
    if (error.code === 11000) return ERRORS.USER_ALREADY_REGISTERED;
    capture(error);
  }
};

export const inviteReferent = async (referent, { role, user }, etablissement) => {
  // Send invite
  const cta = `${config.ADMIN_URL}/creer-mon-compte?token=${referent.invitationToken}`;
  const fromName = `${user.firstName} ${user.lastName}`;
  const toName = `${referent.firstName} ${referent.lastName}`;
  const name_school = `${etablissement.name}`;

  await sendTemplate(SENDINBLUE_TEMPLATES.invitationReferent[role], {
    emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
    params: { cta, fromName, toName, name_school },
  });
};

export const doInviteMultipleChefsEtablissementsToInscription = async (emails: string[]) => {
  for (const email of emails) {
    try {
      await doInviteChefEtablissementToInscription(email);
    } catch (error) {
      capture(error, "failed sending invitations inscription");
    }
  }
};

export const doInviteChefEtablissementToInscription = async (email: string) => {
  const referent: ReferentDocument = await ReferentModel.findOne({ email });
  if (!referent) {
    throw new Error("Referent not found: " + email);
  }
  const invitationToken = randomUUID();
  referent.set({
    invitationToken,
    invitationExpires: inSevenDays(),
  });
  await referent.save();

  // TODO : calculate nbreClasseAValider and effectifPrevisionnel
  const etablissement: EtablissementDocument = await CleEtablissementModel.findOne({ referentEtablissementIds: referent._id });

  // Send invite
  const inscriptionUrl = `${config.ADMIN_URL}/creer-mon-compte?token=${invitationToken}`;
  const toName = `${referent.firstName} ${referent.lastName}`;
  const name_school = `${etablissement.name}`;
  await sendTemplate(SENDINBLUE_TEMPLATES.INVITATION_CHEF_ETABLISSEMENT_TO_INSCRIPTION_TEMPLATE, {
    emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
    params: { cta: inscriptionUrl, toName, name_school },
  });
};

export const doInviteMultipleChefsEtablissementsToConfirmation = async (emails: string[]) => {
  for (const email of emails) {
    try {
      await doInviteChefEtablissementToConfirmation(email);
    } catch (error) {
      capture(error, "failed sending invitations confirmation");
    }
  }
};
export const doInviteChefEtablissementToConfirmation = async (email: string) => {
  const referent: ReferentDocument = await ReferentModel.findOne({ email });
  if (!referent) {
    throw new Error("Referent not found: " + email);
  }
  const invitationToken = randomUUID();
  referent.set({
    invitationToken,
    invitationExpires: inSevenDays(),
  });
  await referent.save();

  const etablissement: EtablissementDocument = await CleEtablissementModel.findOne({ referentEtablissementIds: referent._id });

  // Send invite
  const inscriptionUrl = `${config.ADMIN_URL}/creer-mon-compte/confirmation?token=${invitationToken}`;
  const toName = `${referent.firstName} ${referent.lastName}`;
  const name_school = `${etablissement.name}`;
  await sendTemplate(SENDINBLUE_TEMPLATES.INVITATION_CHEF_ETABLISSEMENT_TO_CONFIRMATION_TEMPLATE, {
    emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
    params: { cta: inscriptionUrl, toName, name_school },
  });
};
