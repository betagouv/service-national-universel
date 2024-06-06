const ReferentObject = require("../models/referent");
const SNUpport = require("../SNUpport");
const { capture, captureMessage } = require("../sentry");
const slack = require("../slack");
const { ROLES } = require("snu-lib");

exports.handler = async () => {
  try {
    const referents = await ReferentObject.find({
      updatedAt: { $gte: new Date(new Date() - 24 * 60 * 60 * 1000) },
      role: { $in: [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION] },
    });
    const response = await SNUpport.api(`/v0/referent`, { method: "POST", credentials: "include", body: JSON.stringify({ referents }) });
    if (!response.ok) {
      captureMessage("Fail sync referent to SNUpport", { extra: { code: response.code } });
      slack.error({ title: "Fail sync referent to SNUpport", text: JSON.stringify(response.code) });
    }
  } catch (e) {
    capture(e);
    throw e;
  }
};
