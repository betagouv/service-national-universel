const { SENDINBLUE_TEMPLATES } = require("snu-lib");
const EtablissementModel = require("../../models/cle/etablissement");
const ClasseModel = require("../../models/cle/classe");
const { capture } = require("../../sentry");
const { sendTemplate } = require("../../sendinblue");

module.exports = (emailsEmitter) => {
  emailsEmitter.on(SENDINBLUE_TEMPLATES.CLE.CONFIRM_SIGNUP_COORDINATEUR, async (referent) => {
    try {
      const etablissement = await EtablissementModel.findOne({ coordinateurIds: referent._id });
      if (!etablissement) throw new Error("Etablissement not found");

      await sendTemplate(SENDINBLUE_TEMPLATES.CLE.CONFIRM_SIGNUP_COORDINATEUR, {
        emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
        params: {
          toName: `${referent.firstName} ${referent.lastName}`,
          schoolName: etablissement.name,
        },
      });
    } catch (error) {
      capture(error);
    }
  });

  emailsEmitter.on(SENDINBLUE_TEMPLATES.CLE.CONFIRM_SIGNUP_REFERENT_ETABLISSEMENT, async (referent) => {
    try {
      const etablissement = await EtablissementModel.findOne({ referentEtablissementIds: referent._id });
      if (!etablissement) throw new Error("Etablissement not found");

      await sendTemplate(SENDINBLUE_TEMPLATES.CLE.CONFIRM_SIGNUP_REFERENT_ETABLISSEMENT, {
        emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
        params: {
          toName: `${referent.firstName} ${referent.lastName}`,
          schoolName: etablissement.name,
        },
      });
    } catch (error) {
      capture(error);
    }
  });

  emailsEmitter.on(SENDINBLUE_TEMPLATES.CLE.CONFIRM_SIGNUP_REFERENT_CLASSE, async (referent) => {
    try {
      const classe = await ClasseModel.findOne({ referentClasseIds: referent._id });
      if (!classe) throw new Error("Classe not found");
      const etablissement = await EtablissementModel.findById(classe.etablissementId);
      if (!etablissement) throw new Error("Etablissement not found");

      await sendTemplate(SENDINBLUE_TEMPLATES.CLE.CONFIRM_SIGNUP_REFERENT_CLASSE, {
        emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
        params: {
          toName: `${referent.firstName} ${referent.lastName}`,
          schoolName: etablissement.name,
        },
      });
    } catch (error) {
      capture(error);
    }
  });
};
