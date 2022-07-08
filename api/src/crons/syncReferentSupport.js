const ReferentObject = require("../models/referent");
const zammood = require("../zammood");
const { capture } = require("../sentry");
const slack = require("../slack");
const { ROLES } = require("snu-lib/roles");

exports.handler = async () => {
  try {
    const referents = await ReferentObject.find({ role: { $in: [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION] } });
    const response = await zammood.api(`/v0/referent`, { method: "POST", credentials: "include", body: JSON.stringify({ referents }) });
    if (!response.ok) slack.error({ title: "Fail sync referent to Zammood", text: JSON.stringify(response.code) });
  } catch (e) {
    capture(`ERROR`, JSON.stringify(e));
    capture(e);
  }
};
