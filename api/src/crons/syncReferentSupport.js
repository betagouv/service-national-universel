const ReferentObject = require("../models/referent");
const zammood = require("../zammood");
const { capture } = require("../sentry");
const slack = require("../slack");
const { ROLES } = require("snu-lib");

exports.handler = async () => {
  try {
    const referents = await ReferentObject.find({
      updatedAt: { $gte: new Date(new Date() - 24 * 60 * 60 * 1000) },
      role: { $in: [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION] },
    });
    const response = await zammood.api(`/v0/referent`, { method: "POST", credentials: "include", body: JSON.stringify({ referents }) });
    if (!response.ok) slack.error({ title: "Fail sync referent to Zammood", text: JSON.stringify(response.code) });
  } catch (e) {
    capture(e);
  }
};
