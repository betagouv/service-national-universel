require("../../mongo");
const { sendTemplate } = require("../../sendinblue");
const slack = require("../../slack");
const { ENVIRONMENT } = require("../../config");
const ReferentModel = require("../../models/referent");
const { departmentList, getDataInscriptions } = require("../utils");
const { capture } = require("../../sentry");
const { ROLES } = require("snu-lib/roles");
const { SENDINBLUE_TEMPLATES } = require("snu-lib");

const debug = (...e) => {
  if (ENVIRONMENT === "production") return;
  console.log(...e);
};

async function handler() {
  try {
    let count = 0;
    let textDepartments = [];
    for (let i = 0; i < departmentList.length; i++) {
      const department = departmentList[i];
      debug("> start department :", department);
      const referents = await ReferentModel.find({ role: ROLES.REFERENT_DEPARTMENT, department });
      if (!(referents && referents.length)) continue;
      debug(referents.length, "referent(s) found");
      const dataInscriptions = await getDataInscriptions({ department });
      debug(dataInscriptions);

      const { all, february, june, july } = dataInscriptions;

      textDepartments.push(`Département ${department} 👇`);
      textDepartments.push(`• global : ${JSON.stringify(all)}`);
      textDepartments.push(`• février : ${JSON.stringify(february)}`);
      textDepartments.push(`• juin : ${JSON.stringify(june)}`);
      textDepartments.push(`• juillet : ${JSON.stringify(july)}`);
      textDepartments.push("---");

      for (let j = 0; j < referents.length; j++) {
        const ref = referents[j];
        let name = `${ref.firstName} ${ref.lastName}`;
        let email = ref.email;
        await sendTemplate(SENDINBLUE_TEMPLATES.referent.RECAP_BI_HEBDO_DEPARTMENT, {
          emailTo: [{ name, email }],
          params: { all, february, june, july },
        });
        count++;
      }
    }
    slack.success({ title: `recap inscription referent department`, text: `${count} mails sent\n\n${textDepartments.join("\n")}` });
  } catch (e) {
    capture(e);
    slack.error({ title: `recap inscription referent department`, text: `Aie ! An error occured !` });
  }
}

module.exports = {
  handler,
};
