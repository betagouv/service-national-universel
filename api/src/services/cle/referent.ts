import { randomUUID } from "node:crypto";
import { addDays } from "date-fns";
import crypto from "crypto";
import config from "config";

import { ROLES, SUB_ROLES, SENDINBLUE_TEMPLATES, InvitationType, ClasseSchoolYear } from "snu-lib";

import { ERRORS } from "../../utils";
import { sendTemplate } from "../../brevo";
import { inSevenDays } from "../../utils";
import { capture } from "../../sentry";

import { EtablissementModel, ReferentModel, ReferentType, ReferentDocument, ClasseModel, EtablissementType } from "../../models";
import { getEstimatedSeatsByEtablissement, getNumberOfClassesByEtablissement } from "../../cle/classe/classeService";
import { UserDto } from "snu-lib";

export interface InvitationResult {
  to: string;
  status: string;
  details?: string;
  type?: ReferentType["metadata"]["invitationType"];
}

export const findOrCreateReferent = async (referent, { etablissement, role, subRole }: { etablissement: EtablissementType; role: string; subRole?: string }) => {
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
    return null;
  }
};

export const inviteReferent = async (
  referent: Pick<ReferentType, "firstName" | "lastName" | "email" | "invitationToken">,
  { role, from }: { role: UserDto["role"]; from: UserDto | null },
  etablissement: EtablissementType,
) => {
  // Send invite
  const cta = `${config.ADMIN_URL}/creer-mon-compte?token=${referent.invitationToken}`;
  const fromName = `${from?.firstName || null} ${from?.lastName || null}`;
  const toName = `${referent.firstName} ${referent.lastName}`;
  const name_school = `${etablissement.name}`;

  return await sendTemplate(SENDINBLUE_TEMPLATES.invitationReferent[role], {
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
  let processCounter = 1;
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
  let templateId = SENDINBLUE_TEMPLATES.CLE.INVITATION_CHEF_ETABLISSEMENT_TO_INSCRIPTION_TEMPLATE;

  if (invitationType === InvitationType.CONFIRMATION) {
    inscriptionUrl = `${config.ADMIN_URL}/verifier-mon-compte?token=${referent.invitationToken}`;
    templateId = SENDINBLUE_TEMPLATES.CLE.INVITATION_CHEF_ETABLISSEMENT_TO_CONFIRMATION_TEMPLATE;
  }

  const toName = `${referent.firstName} ${referent.lastName}`;
  const name_school = `${etablissement.name}`;
  return await sendTemplate(templateId, {
    emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
    params: { cta: inscriptionUrl, toName, name_school, nbreClasseAValider, effectifPrevisionnel, emailEtablissement: referent.email },
  });
};

async function generateInvitationTokenAndSaveReferent(referent: ReferentDocument, user: UserDto) {
  const invitationToken = randomUUID();
  referent.set({
    invitationToken,
    invitationExpires: addDays(new Date(), 50),
  });
  await referent.save({ fromUser: user });
  return referent;
}

export const doInviteMultipleReferentClasse = async (user: UserDto) => {
  const referentsClasseToSendInvitation = await ReferentModel.find({
    "metadata.isFirstInvitationPending": true,
    role: ROLES.REFERENT_CLASSE,
  });
  const invitations: InvitationResult[] = [];
  let processCounter = 1;
  for (const referentClasse of referentsClasseToSendInvitation) {
    try {
      console.log("AppelAProjetService.sync() - processCounter: ", processCounter++, "/", referentsClasseToSendInvitation.length);
      console.log("doInviteMultipleReferentClasse() - creating invitation for :", referentClasse.email);
      const mailResponse = await doInviteReferentClasse(referentClasse, user);
      referentClasse.set({ metadata: { ...referentClasse.metadata, isFirstInvitationPending: false } });
      await referentClasse.save({ fromUser: user });
      if (mailResponse) {
        invitations.push({ to: referentClasse.email, status: "ok", type: referentClasse.metadata.invitationType });
      } else {
        invitations.push({ to: referentClasse.email, status: "notSent", details: mailResponse, type: referentClasse.metadata.invitationType });
      }
    } catch (error) {
      invitations.push({ to: referentClasse.email, status: "error", details: error.message, type: referentClasse.metadata.invitationType });
      capture(error, "failed sending invitations inscription");
    }
  }
  return invitations;
};

export const doInviteReferentClasse = async (referentClasse: ReferentDocument, user: UserDto) => {
  const referent = await generateInvitationTokenAndSaveReferent(referentClasse, user);
  const invitationType = referent.metadata.invitationType;

  const classe = await ClasseModel.findOne({ referentClasseIds: referent._id });
  if (!classe) {
    throw new Error("Classe not found for referent : " + referent._id);
  }
  const etablissement = await EtablissementModel.findById(classe.etablissementId);
  if (!etablissement) {
    throw new Error("Etablissement not found for referent : " + referent._id);
  }

  let inscriptionUrl = `${config.ADMIN_URL}/creer-mon-compte?token=${referent.invitationToken}`;
  let templateId = SENDINBLUE_TEMPLATES.CLE.INVITATION_REFERENT_CLASSE_TO_INSCRIPTION_TEMPLATE;

  if (invitationType === InvitationType.CONFIRMATION) {
    inscriptionUrl = `${config.ADMIN_URL}/verifier-mon-compte?token=${referent.invitationToken}`;
    templateId = SENDINBLUE_TEMPLATES.CLE.INVITATION_REFERENT_CLASSE_TO_CONFIRMATION_TEMPLATE;
  }

  const toName = `${referent.firstName} ${referent.lastName}`;
  const name_school = `${etablissement.name}`;
  return await sendTemplate(templateId, {
    emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
    params: { cta: inscriptionUrl, toName, name_school, emailEtablissement: referent.email },
  });
};

export async function deleteOldReferentClasse(user: UserDto) {
  // on récupère tous les ids des referents de classe valides (2024-2025)
  const classes = await ClasseModel.find({ schoolYear: ClasseSchoolYear.YEAR_2024_2025, deletedAt: { $exists: false } }).select({ _id: 1, referentClasseIds: 1 });
  const referentIdsInClasses = classes.reduce((acc, classe) => {
    return [...acc, ...classe.referentClasseIds];
  }, []);

  // on récupère tous les ids des referent de classe non rattachés à une classe 2024-2025
  const referentsNotInClasses = await ReferentModel.find({
    role: ROLES.REFERENT_CLASSE,
    deletedAt: { $exists: false },
    _id: { $nin: referentIdsInClasses },
  }).distinct("_id");

  const updatedReferents: InvitationResult[] = [];
  // on soft delete tous les rérérents de classes non rattachés à une classe 2024-2025
  for (const referentClasse of referentsNotInClasses) {
    referentClasse.set({ deletedAt: new Date() });
    referentClasse.save({ fromUser: user });
    const mailResponse = await sendTemplate(SENDINBLUE_TEMPLATES.CLE.SUPPRESSION_ANCIEN_REFERENT_CLASSE_TEMPLATE, {
      emailTo: [{ name: `${referentClasse.firstName} ${referentClasse.lastName}`, email: referentClasse.email }],
      params: {},
    });
    updatedReferents.push({ to: referentClasse.email, status: mailResponse ? "ok" : "notSent", details: mailResponse || "" });
  }

  return updatedReferents;
}
