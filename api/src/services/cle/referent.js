const crypto = require("crypto");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { ERRORS } = require("../../utils");
const { sendTemplate } = require("../../sendinblue");
const config = require("../../config");
const ReferentModel = require("../../models/referent");
const { inSevenDays } = require("../../utils");
const { capture } = require("../../sentry");

const findOrCreateReferent = async (referent, { etablissement, role, subRole }) => {
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

const inviteReferent = async (referent, { role, user }, etablissement) => {
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

const ACADEMIQUE_DOMAINS = [
  "ac-clermont.fr",
  "ac-grenoble.fr",
  "ac-besancon.fr",
  "ac-dijon.fr",
  "ac-rennes.fr",
  "ac-orleans-tours.fr",
  "ac-corse.fr",
  "ac-nancy-metz.fr",
  "ac-reims.fr",
  "ac-strasbourg.fr",
  "ac-guadeloupe.fr",
  "ac-guyane.fr",
  "ac-amiens.fr",
  "ac-lille.fr",
  "ac-creteil.fr",
  "ac-paris.fr",
  "ac-versailles.fr",
  "ac-reunion.fr",
  "ac-martinique.fr",
  "ac-mayotte.fr",
  "ac-normandie.fr",
  "ac-bordeaux.fr",
  "ac-limoges.fr",
  "ac-poitiers.fr",
  "ac-noumea.nc",
  "ac-montpellier.fr",
  "ac-toulouse.fr",
  "ac-nantes.fr",
  "ac-polynesie.pf",
  "ac-aix-marseille.fr",
  "ac-nice.fr",
  "ac-spm.fr",
  "ac-lyon.fr",
];

const validateEmailAcademique = (email) => {
  if (["testing", "development"].includes(config.ENVIRONMENT)) return true;
  const domain = email.split("@")[1];
  if (!domain) return false;
  return ACADEMIQUE_DOMAINS.includes(domain);
};

module.exports = {
  findOrCreateReferent,
  inviteReferent,
  validateEmailAcademique,
};
