const { YoungModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    const youngs = await YoungModel.find({ status: "DELETED" });
    for (const young of youngs) {
      const fieldToKeep = [
        "_id",
        "__v",
        "birthdateAt",
        "cohort",
        "gender",
        "situation",
        "grade",
        "qpv",
        "populationDensity",
        "handicap",
        "ppsBeneficiary",
        "paiBeneficiary",
        "highSkilledActivity",
        "statusPhase1",
        "statusPhase2",
        "phase2ApplicationStatus",
        "statusPhase3",
        "inscriptionStep2023",
        "inscriptionDoneDate",
        "reinscriptionStep2023",
        "department",
        "region",
        "zip",
        "city",
        "createdAt",
        "status",
        "email",
      ];
      for (const key in young._doc) {
        if (!fieldToKeep.find((val) => val === key)) {
          young.set({ [key]: undefined });
        }
      }
      await young.save({ fromUser: "Rattrappage des jeunes deleted" });
    }
  },
};
