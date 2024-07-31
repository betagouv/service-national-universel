import { randomUUID } from "node:crypto";
import { addDays } from "date-fns";
import crypto from "crypto";
import config from "config";

import { ROLES, SUB_ROLES, SENDINBLUE_TEMPLATES, InvitationType } from "snu-lib";

import { ERRORS } from "../../utils";
import { sendTemplate } from "../../brevo";
import { inSevenDays } from "../../utils";
import { capture } from "../../sentry";

import { EtablissementModel, ReferentModel, ReferentType, ReferentDocument } from "../../models";
import { getEstimatedSeatsByEtablissement, getNumberOfClassesByEtablissement } from "../../cle/classe/classeService";
import { UserDto } from "snu-lib";

export interface InvitationResult {
  to: string;
  status: string;
  details?: string;
  type?: ReferentType["metadata"]["invitationType"];
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
  const referent: ReferentType = await generateInvitationTokenAndSaveReferent(chefEtablissement, user);
  const invitationType = referent.metadata.invitationType;

  const etablissement = await EtablissementModel.findOne({ referentEtablissementIds: referent._id });
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
    params: { cta: inscriptionUrl, toName, name_school, nbreClasseAValider, effectifPrevisionnel, emailEtablissement: referent.email },
  });
};

async function generateInvitationTokenAndSaveReferent(chefEtablissement: ReferentDocument, user: UserDto) {
  const invitationToken = randomUUID();
  chefEtablissement.set({
    invitationToken,
    invitationExpires: addDays(new Date(), 50),
  });
  //@ts-ignore
  await chefEtablissement.save({ fromUser: user });
  return chefEtablissement;
}
