const { SENDINBLUE_TEMPLATES, ROLES, SUB_ROLES } = require("snu-lib");
const EtablissementModel = require("../../models/cle/etablissement");
const ReferentModel = require("../../models/referent");
const { capture } = require("../../sentry");
const config = require("config");
const { sendTemplate } = require("../../sendinblue");
const { getEstimatedSeatsByEtablissement, getNumberOfClassesByEtablissement } = require("../../cle/classe/classeService");

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
          cta: `${config.ADMIN_URL}/classes/${classe._id.toString()}`,
        },
      });
    } catch (error) {
      capture(error);
    }
  });

  // Cohort updated
  emailsEmitter.on(SENDINBLUE_TEMPLATES.CLE.CLASSE_COHORT_UPDATED, async (classe) => {
    try {
      const etablissement = await EtablissementModel.findById(classe.etablissementId);
      if (!etablissement) throw new Error("Etablissement not found");

      const referents = await ReferentModel.find({ _id: { $in: [...classe.referentClasseIds, ...etablissement.referentEtablissementIds, ...etablissement.coordinateurIds] } });
      if (!referents?.length) throw new Error("Referents not found");

      await sendTemplate(SENDINBLUE_TEMPLATES.CLE.CLASSE_COHORT_UPDATED, {
        emailTo: referents.map((referent) => ({ email: referent.email, name: `${referent.firstName} ${referent.lastName}` })),
        params: {
          class_name: classe.name,
          class_code: classe.uniqueKeyAndId,
          cta: `${config.ADMIN_URL}/classes/${classe._id.toString()}`,
          cohorte: classe.cohort,
        },
      });
    } catch (error) {
      capture(error);
    }
  });

  //classe verified
  emailsEmitter.on(SENDINBLUE_TEMPLATES.CLE.CLASSE_VERIFIED, async (classe) => {
    try {
      const etablissement = await EtablissementModel.findById(classe.etablissementId);
      if (!etablissement) throw new Error("Etablissement not found");

      // Admins CLE
      const referents = await ReferentModel.find({ _id: { $in: [...etablissement.referentEtablissementIds, ...etablissement.coordinateurIds] } });
      if (!referents?.length) throw new Error("Referents not found");
      await sendTemplate(SENDINBLUE_TEMPLATES.CLE.CLASSE_VERIFIED, {
        emailTo: referents.map((referent) => ({ email: referent.email, name: `${referent.firstName} ${referent.lastName}` })),
        params: {
          class_name: classe.name,
          class_code: classe.uniqueKeyAndId,
          classUrl: `${config.ADMIN_URL}/classes/${classe._id.toString()}`,
        },
      });

      // Referents departementaux
      const refsDep = [...(await getReferentDep(etablissement.department))];

      await sendTemplate(SENDINBLUE_TEMPLATES.CLE.CLASSE_VERIFIED_DEP_REG, {
        emailTo: refsDep.map((referent) => ({ email: referent.email, name: `${referent.firstName} ${referent.lastName}` })),
        params: {
          class_name: classe.name,
          class_code: classe.uniqueKeyAndId,
          cta: `${config.ADMIN_URL}/classes/${classe._id.toString()}`,
        },
      });
    } catch (error) {
      capture(error);
    }
  });

  // Notify admin CLE Verif
  emailsEmitter.on(SENDINBLUE_TEMPLATES.CLE.CLASSE_NOTIFY_VERIF, async (classe) => {
    try {
      const etablissement = await EtablissementModel.findById(classe.etablissementId);
      if (!etablissement) throw new Error("Etablissement not found");
      // Admins CLE
      const referents = await ReferentModel.find({ _id: { $in: [...etablissement.referentEtablissementIds, ...etablissement.coordinateurIds] } });
      if (!referents?.length) throw new Error("Referents not found");

      const chefEtablissement = referents.find((referent) => referent.subRole === SUB_ROLES.referent_etablissement);
      const isRegistered = chefEtablissement.lastLoginAt;
      if (isRegistered) {
        await sendTemplate(SENDINBLUE_TEMPLATES.CLE.CLASSE_NOTIFY_VERIF, {
          emailTo: referents.map((referent) => ({ email: referent.email, name: `${referent.firstName} ${referent.lastName}` })),
          params: {
            class_name: classe.name,
            class_code: classe.uniqueKeyAndId,
            classUrl: `${config.ADMIN_URL}/classes/${classe._id.toString()}`,
          },
        });
      } else {
        const nbreClasseAValider = await getNumberOfClassesByEtablissement(etablissement);
        const effectifPrevisionnel = await getEstimatedSeatsByEtablissement(etablissement);
        await sendTemplate(SENDINBLUE_TEMPLATES.INVITATION_CHEF_ETABLISSEMENT_TO_INSCRIPTION_TEMPLATE, {
          emailTo: [{ name: `${chefEtablissement.firstName} ${chefEtablissement.lastName}`, email: chefEtablissement.email }],
          params: {
            cta: `${config.ADMIN_URL}/creer-mon-compte?token=${chefEtablissement.invitationToken}`,
            toName: `${chefEtablissement.firstName} ${chefEtablissement.lastName}`,
            name_school: etablissement.name,
            nbreClasseAValider,
            effectifPrevisionnel,
          },
        });
      }
    } catch (error) {
      capture(error);
    }
  });
};

//We want to send emails to the right referents department
//manager_department -> if not assistant_manager_department -> if not secretariat -> if not manager_phase2
//end case -> all referent_department (never happens)
const getReferentDep = async (department) => {
  let toReferent = [];
  toReferent = await ReferentModel.find({
    subRole: SUB_ROLES.manager_department,
    role: ROLES.REFERENT_DEPARTMENT,
    department,
  });

  if (!toReferent.length) {
    toReferent = await ReferentModel.find({
      subRole: SUB_ROLES.assistant_manager_department,
      role: ROLES.REFERENT_DEPARTMENT,
      department,
    });
  }

  if (!toReferent.length) {
    toReferent = await ReferentModel.find({
      subRole: SUB_ROLES.secretariat,
      role: ROLES.REFERENT_DEPARTMENT,
      department,
    });
  }

  if (!toReferent.length) {
    toReferent = await ReferentModel.find({
      subRole: SUB_ROLES.manager_phase2,
      role: ROLES.REFERENT_DEPARTMENT,
      department,
    });
  }

  if (!toReferent.length) {
    toReferent = await ReferentModel.find({
      role: ROLES.REFERENT_DEPARTMENT,
      department,
    });
  }
  return toReferent;
};

//We want to send emails to the right referents region
//coordinator -> if not assistant_coordinator -> if not secretariat
//end case -> all referent_region (never happens)
const getReferentReg = async (region) => {
  let toReferent = [];
  toReferent = await ReferentModel.find({
    subRole: SUB_ROLES.coordinator,
    role: ROLES.REFERENT_REGION,
    region,
  });

  if (!toReferent.length) {
    toReferent = await ReferentModel.find({
      subRole: SUB_ROLES.assistant_coordinator,
      role: ROLES.REFERENT_REGION,
      region,
    });
  }

  if (!toReferent.length) {
    toReferent = await ReferentModel.find({
      subRole: SUB_ROLES.secretariat,
      role: ROLES.REFERENT_REGION,
      region,
    });
  }

  if (!toReferent.length) {
    toReferent = await ReferentModel.find({
      role: ROLES.REFERENT_REGION,
      region,
    });
  }
  return toReferent;
};
