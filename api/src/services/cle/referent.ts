import { CleEtablissementModel, ReferentModel } from "../../models";
import { EtablissementDocument } from "../../models/cle/etablissementType";
import { randomUUID } from "node:crypto";
import { getEstimatedSeatsByEtablissement, getNumberOfClassesByEtablissement } from "../../cle/classe/classeService";
import { UserDto } from "snu-lib/src/dto";
import { IReferent } from "../../models/referentType";

const crypto = require("crypto");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { ERRORS } = require("../../utils");
const { sendTemplate } = require("../../sendinblue");
const config = require("config");
const { inSevenDays } = require("../../utils");
const { capture } = require("../../sentry");

export interface InvitationResult {
  to: string;
  status: string;
  details?: string;
  type?: InvitationType;
}

export enum InvitationType {
  INSCRIPTION = "INSCRIPTION",
  CONFIRMATION = "CONFIRMATION",
}

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

export const doInviteMultipleChefsEtablissements = async (emails: string[], user: UserDto, invitationType: InvitationType) => {
  const invitations: InvitationResult[] = [];
  for (const email of emails) {
    try {
      const mailResponse = await doInviteChefEtablissement(email, user, invitationType);
      if (mailResponse) {
        invitations.push({ to: email, status: "ok", type: invitationType });
      } else {
        invitations.push({ to: email, status: "notSent", details: mailResponse, type: invitationType });
      }
    } catch (error) {
      invitations.push({ to: email, status: "error", details: error.message, type: invitationType });
      capture(error, "failed sending invitations inscription");
    }
  }
  return invitations;
};

export const doInviteChefEtablissement = async (email: string, user: UserDto, invitationType: InvitationType) => {
  const referent: IReferent = await generateInvitationTokenAndSaveReferent(email, user);

  const etablissement: EtablissementDocument = await CleEtablissementModel.findOne({ referentEtablissementIds: referent._id });
  const nbreClasseAValider = await getNumberOfClassesByEtablissement(etablissement);
  const effectifPrevisionnel = await getEstimatedSeatsByEtablissement(etablissement);

  let inscriptionUrl = `${config.ADMIN_URL}/creer-mon-compte?token=${referent.invitationToken}`;
  if (invitationType === InvitationType.CONFIRMATION) {
    inscriptionUrl = `${config.ADMIN_URL}/verifier-mon-compte?token=${referent.invitationToken}`;
  }
  let templateId = SENDINBLUE_TEMPLATES.INVITATION_CHEF_ETABLISSEMENT_TO_INSCRIPTION_TEMPLATE;
  if (invitationType === InvitationType.CONFIRMATION) {
    templateId = SENDINBLUE_TEMPLATES.INVITATION_CHEF_ETABLISSEMENT_TO_CONFIRMATION_TEMPLATE;
  }
  const toName = `${referent.firstName} ${referent.lastName}`;
  const name_school = `${etablissement.name}`;
  return await sendTemplate(templateId, {
    emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
    params: { cta: inscriptionUrl, toName, name_school, nbreClasseAValider, effectifPrevisionnel },
  });
};

async function generateInvitationTokenAndSaveReferent(email: string, user: UserDto) {
  const referent = await ReferentModel.findOne({ email });
  if (!referent) {
    throw new Error("Referent not found: " + email);
  }
  const invitationToken = randomUUID();
  referent.set({
    invitationToken,
    invitationExpires: inSevenDays(),
  });
  await referent.save({ fromUser: user });
  return referent;
}
