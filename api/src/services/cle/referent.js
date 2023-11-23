const crypto = require("crypto");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { ERRORS } = require("../../utils");
const { sendTemplate } = require("../../sendinblue");
const config = require("../../config");
const ReferentModel = require("../../models/referent");
const { inSevenDays } = require("../../utils");
const { capture } = require("../../sentry");

const findOrCreateReferent = async (referent, { etablissement, role, subRole, session }) => {
  try {
    // Return if already exists
    if (referent._id) return referent;

    // Create referent
    if (!referent.email || !referent.firstName || !referent.lastName) throw new Error("Missing referent email or firstName or lastName");
    const invitationToken = crypto.randomBytes(20).toString("hex");
    referent = await ReferentModel.create(
      [
        {
          ...referent,
          role,
          subRole,
          invitationToken,
          invitationExpires: inSevenDays(),
          department: etablissement.department,
          region: etablissement.region,
        },
      ],
      { session: session },
    );

    return referent[0];
  } catch (e) {
    if (e.code === 11000) return ERRORS.USER_ALREADY_REGISTERED;
    capture(e);
  }
};

const inviteReferent = async (referent, { role, user }) => {
  // Send invite
  const cta = `${config.ADMIN_URL}/auth/signup/invite?token=${referent.invitationToken}`;
  const fromName = `${user.firstName} ${user.lastName}`;
  const toName = `${referent.firstName} ${referent.lastName}`;

  await sendTemplate(SENDINBLUE_TEMPLATES.invitationReferent[role], {
    emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
    params: { cta, fromName, toName },
  });
};

module.exports = {
  findOrCreateReferent,
  inviteReferent,
};
