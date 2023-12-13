require("../../Infrastructure/Databases/Mongo/mongo");
const { capture } = require("../../Infrastructure/Services/sentry");
const slack = require("../../Infrastructure/Services/slack");
const ContractModel = require("../../Infrastructure/Databases/Mongo/Models/contract");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const { ADMIN_URL } = require("../../Infrastructure/Config/config");
const { sendTemplate } = require("../../Infrastructure/Services/sendinblue");
const { getReferentManagerPhase2 } = require("../Utils");

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
