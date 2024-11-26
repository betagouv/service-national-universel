const { capture } = require("../sentry");
const slack = require("../slack");
const { ContractModel } = require("../models");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { config } = require("../config");
const { sendTemplate } = require("../brevo");
const { getReferentManagerPhase2 } = require("../utils");

const trigger = async () => {
  let countContractNotified = 0;
  let total = 0;
  const now = Date.now();
  const cursor = await ContractModel.find({ invitationSent: false }).cursor();
  await cursor.eachAsync(async function (contract) {
    total++;
    if (diffDays(contract.updatedAt, now) === 1) {
      countContractNotified++;
      let referentManagerPhase2 = await getReferentManagerPhase2(contract.youngDepartment);
      let emailTo = referentManagerPhase2.map((referent) => ({
        name: `${referent.firstName} ${referent.lastName}`,
        email: referent.email,
      }));
      await sendTemplate(SENDINBLUE_TEMPLATES.referent.CONTRACT_DRAFT, {
        emailTo: emailTo,
        params: {
          youngFirstName: contract?.youngFirstName,
          youngLastName: contract?.youngLastName,
          missionName: contract?.missionName,
          cta: `${config.ADMIN_URL}/volontaire/${contract.youngId}/phase2/application/${contract.applicationId}/contrat`,
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
    throw e;
  }
};

const diffDays = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
