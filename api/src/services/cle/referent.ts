import { CleEtablissementModel, ReferentModel } from "../../models";
import { EtablissementDocument } from "../../models/cle/etablissementType";
import { randomUUID } from "node:crypto";
import { getEstimatedSeatsByEtablissement, getNumberOfClassesByEtablissement } from "../../cle/classe/classeService";
import { UserDto } from "snu-lib/src/dto";
import { IReferent, ReferentDocument } from "../../models/referentType";
import { ROLES, SUB_ROLES } from "snu-lib";

const crypto = require("crypto");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { ERRORS } = require("../../utils");
const { sendTemplate } = require("../../sendinblue");
const config = require("config");
const { inSevenDays } = require("../../utils");
const { capture } = require("../../sentry");
const datefns = require("date-fns");

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

export const doInviteMultipleChefsEtablissements = async (user: UserDto) => {
  const chefsEtablissementsToSendInvitation = await ReferentModel.find({
    "metadata.isFirstInvitationPending": true,
    role: ROLES.ADMINISTRATEUR_CLE,
    subRole: SUB_ROLES.referent_etablissement,
  });
  const invitations: InvitationResult[] = [];
  let processCounter = 0;
  for (const chefEtablissement of chefsEtablissementsToSendInvitation) {
    try {
      console.log("AppelAProjetService.sync() - processCounter: ", processCounter++, "/", chefsEtablissementsToSendInvitation.length);
      console.log("doInviteMultipleChefsEtablissements() - creating invitation for :", chefEtablissement.email);
      const mailResponse = await doInviteChefEtablissement(chefEtablissement, user);
      chefEtablissement.set({ metadata: { ...chefEtablissement.metadata, isFirstInvitationPending: false } });
      await chefEtablissement.save({ fromUser: user });
      if (mailResponse) {
        invitations.push({ to: chefEtablissement.email, status: "ok", type: chefEtablissement.metadata.invitationType });
      } else {
        invitations.push({ to: chefEtablissement.email, status: "notSent", details: mailResponse, type: chefEtablissement.metadata.invitationType });
      }
    } catch (error) {
      invitations.push({ to: chefEtablissement.email, status: "error", details: error.message, type: chefEtablissement.metadata.invitationType });
      capture(error, "failed sending invitations inscription");
    }
  }
  return invitations;
};

export const doInviteChefEtablissement = async (chefEtablissement: ReferentDocument, user: UserDto) => {
  const referent: IReferent = await generateInvitationTokenAndSaveReferent(chefEtablissement, user);
  const invitationType = referent.metadata.invitationType;

  const etablissement: EtablissementDocument = await CleEtablissementModel.findOne({ referentEtablissementIds: referent._id });
  if (!etablissement) {
    throw new Error("Etablissement not found for referent : " + referent._id);
  }
  const nbreClasseAValider = await getNumberOfClassesByEtablissement(etablissement);
  const effectifPrevisionnel = await getEstimatedSeatsByEtablissement(etablissement);

  let inscriptionUrl = `${config.ADMIN_URL}/creer-mon-compte?token=${referent.invitationToken}`;
  let templateId = SENDINBLUE_TEMPLATES.INVITATION_CHEF_ETABLISSEMENT_TO_INSCRIPTION_TEMPLATE;

  if (invitationType === InvitationType.CONFIRMATION) {
    inscriptionUrl = `${config.ADMIN_URL}/verifier-mon-compte?token=${referent.invitationToken}`;
    templateId = SENDINBLUE_TEMPLATES.INVITATION_CHEF_ETABLISSEMENT_TO_CONFIRMATION_TEMPLATE;
  }

  const toName = `${referent.firstName} ${referent.lastName}`;
  const name_school = `${etablissement.name}`;
  return await sendTemplate(templateId, {
    emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
    params: { cta: inscriptionUrl, toName, name_school, nbreClasseAValider, effectifPrevisionnel },
  });
};

async function generateInvitationTokenAndSaveReferent(chefEtablissement: ReferentDocument, user: UserDto) {
  const invitationToken = randomUUID();
  chefEtablissement.set({
    invitationToken,
    invitationExpires: datefns.addDays(new Date(), 50),
  });
  //@ts-ignore
  await chefEtablissement.save({ fromUser: user });
  return chefEtablissement;
}