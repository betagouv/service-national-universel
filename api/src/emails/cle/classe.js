const { SENDINBLUE_TEMPLATES, ROLES } = require("snu-lib");
const EtablissementModel = require("../../models/cle/etablissement");
const ReferentModel = require("../../models/referent");
const { capture } = require("../../sentry");
const config = require("../../config");
const { sendTemplate } = require('../../sendinblue');

module.exports = (emailsEmitter) => {

  // Classe created
  emailsEmitter.on(SENDINBLUE_TEMPLATES.CLE.CLASSE_CREATED, async (classe) => {
    try {
      const etablissement = await EtablissementModel.findById(classe.etablissementId);
      if (!etablissement) throw new Error("Etablissement not found");
  
      const referents = await ReferentModel.find({ _id: { $in: [...etablissement.referentEtablissementIds, ...etablissement.coordinateurIds] } });
      if (!referents?.length) throw new Error("Referents not found");
  
      await sendTemplate(SENDINBLUE_TEMPLATES.CLE.CLASSE_CREATED, {
        emailTo: referents.map((referent) => ({ email: referent.email, name: `${referent.firstName} ${referent.lastName}` })),
        params: {
          class_name: classe.name,
          class_code: classe.uniqueKeyAndId,
        },
      });
    } catch (error) {
      capture(error);
    }
  });

  // Classe infos completed
  emailsEmitter.on(SENDINBLUE_TEMPLATES.CLE.CLASSE_INFOS_COMPLETED, async (classe) => {
    try {
      const etablissement = await EtablissementModel.findById(classe.etablissementId);
      if (!etablissement) throw new Error("Etablissement not found");
  
      // Admins
      const referents = await ReferentModel.find({ _id: { $in: [...classe.referentClasseIds, ...etablissement.referentEtablissementIds, ...etablissement.coordinateurIds] } });
      if (!referents?.length) throw new Error("Referents not found");
      await sendTemplate(SENDINBLUE_TEMPLATES.CLE.CLASSE_INFOS_COMPLETED, {
        emailTo: referents.map((referent) => ({ email: referent.email, name: `${referent.firstName} ${referent.lastName}` })),
        params: {
          class_name: classe.name,
          class_code: classe.uniqueKeyAndId,
          classUrl: `${config.APP_URL}/je-rejoins-ma-classe-engagee?id=${classe._id.toString()}`,
        },
      });
  
      // Referents departementaux et régionaux
      const refsDepReg = await ReferentModel.find({
        $or: [
          {
            $and: [
              { role: ROLES.REFERENT_DEPARTMENT },
              { departement: { $in: [etablissement.departement] } },
            ]
          },
          {
            $and: [
              { role: ROLES.REFERENT_REGION },
              { region: etablissement.region },
            ]
          },
        ],
      });
      await sendTemplate(SENDINBLUE_TEMPLATES.CLE.CLASSE_INFOS_COMPLETED_DEP_REG, {
        emailTo: refsDepReg.map((referent) => ({ email: referent.email, name: `${referent.firstName} ${referent.lastName}` })),
        params: {
          class_name: classe.name,
          class_code: classe.uniqueKeyAndId,
        },
      });
    } catch (error) {
      capture(error);
    }
  });

  // Classe validated
  emailsEmitter.on(SENDINBLUE_TEMPLATES.CLE.CLASSE_VALIDATED, async (classe) => {
    try {
      const etablissement = await EtablissementModel.findById(classe.etablissementId);
      if (!etablissement) throw new Error("Etablissement not found");
  
      // Referents departementaux et régionaux
      const refsDepReg = await ReferentModel.find({
        $or: [
          {
            $and: [
              { role: ROLES.REFERENT_DEPARTMENT },
              { departement: { $in: [etablissement.departement] } },
            ]
          },
          {
            $and: [
              { role: ROLES.REFERENT_REGION },
              { region: etablissement.region },
            ]
          },
        ],
      });
      await sendTemplate(SENDINBLUE_TEMPLATES.CLE.CLASSE_VALIDATED, {
        emailTo: refsDepReg.map((referent) => ({ email: referent.email, name: `${referent.firstName} ${referent.lastName}` })),
        params: {
          class_name: classe.name,
          class_code: classe.uniqueKeyAndId,
        },
      });
    } catch (error) {
      capture(error);
    }
  });
}
