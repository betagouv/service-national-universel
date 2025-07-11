const { ReferentModel } = require("../models");
const SNUpport = require("../SNUpport");
const { capture, captureMessage } = require("../sentry");
const slack = require("../slack");
const { ROLES } = require("snu-lib");

exports.handler = async () => {
  try {
    let referents = await ReferentModel.find({
        updatedAt: { $gte: new Date(new Date() - 24 * 60 * 60 * 1000) },
        role: { $in: [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION] },
      },
      'email firstName lastName department region role -lastLogoutAt -passwordChangedAt'
    ).lean();
    referents = referents.map(i => {
      const { _id, department, ...rest } = i;
      return {
        ...rest,
        id: _id.toString(),
        departments: department,
      };
    });
    const response = await SNUpport.api(`/v0/referent`, { method: "POST", credentials: "include", body: JSON.stringify({ referents })});
    if (!response.ok) {
      captureMessage("Fail sync referent to SNUpport", { extra: { code: response.code } });
      slack.error({ title: "Fail sync referent to SNUpport", text: JSON.stringify(response.code) });
    }
  } catch (e) {
    capture(e);
    throw e;
  }
};
