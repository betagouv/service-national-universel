require("dotenv").config({ path: "./../../.env-staging" });
require("../mongo");
const { capture } = require("../sentry");
const slack = require("../slack");
const ContractModel = require("../models/contract");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { ADMIN_URL } = require("../config");
const { sendTemplate } = require("../sendinblue");

const trigger = async () => {
  let countContractNotified = 0;
  let total = 0;
  const now = Date.now();
  const cursor = await ContractModel.find({ invitationSent: false }).cursor();
  await cursor.eachAsync(async function (contract) {
    total++;
    if (diffDays(contract.updatedAt, now) === 1) {
      countContractNotified++;
      await sendTemplate(SENDINBLUE_TEMPLATES.referent.CONTRACT_DRAFT, {
        emailTo: [{ name: `${contract?.projectManagerFirstName} ${contract?.projectManagerLastName}`, email: contract?.projectManagerEmail }],
        params: {
          youngFirstName: contract?.youngFirstName,
          youngLastName: contract?.youngLastName,
          missionName: contract?.missionName,
          cta: `${ADMIN_URL}/volontaire/${contract.youngId}/phase2/application/${contract.applicationId}/contrat`,
        },
      });
    }
  });
  slack.success({ title: "contract relance", text: `${countContractNotified}/${total} draft contract have been notified !` });
};

exports.handler = async () => {
  try {
    trigger();
  } catch (e) {
    capture(e);
    slack.error({ title: "contract relance", text: JSON.stringify(e) });
  }
};

const diffDays = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
