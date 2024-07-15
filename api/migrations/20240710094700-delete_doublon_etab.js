const EtablissementModel = require("../src/models/cle/etablissement");
const ClasseModel = require("../src/models/cle/classe");
const YoungModel = require("../src/models/young");

module.exports = {
  async up(db, client) {
    const uaiValues = ["0470020S", "0240007C", "0690129R", "0670049P", "0320015T", "0100016N"];

    const etablissements = await EtablissementModel.find({ uai: { $in: uaiValues } });
    const groupedEtablissements = etablissements.reduce((acc, etablissement) => {
      acc[etablissement.uai] = acc[etablissement.uai] || [];
      acc[etablissement.uai].push(etablissement);
      return acc;
    }, {});

    const backupCollection = db.collection("deleted_etablissements_backup");

    for (const uai in groupedEtablissements) {
      const etabs = groupedEtablissements[uai];

      if (etabs.length > 1) {
        for (let i = 0; i < etabs.length; i++) {
          const etablissement = etabs[i];

          const classeCount = await ClasseModel.countDocuments({ etablissementId: etablissement._id });

          const youngCount = await YoungModel.countDocuments({ etablissementId: etablissement._id });

          if (classeCount === 0 && youngCount === 0) {
            await backupCollection.insertOne(etablissement);
            await EtablissementModel.deleteOne({ _id: etablissement._id });
          }
        }
      }
    }
    const backupCount = await backupCollection.countDocuments({});
    if (backupCount === 0) {
      await backupCollection.drop();
    }
  },

  async down(db, client) {
    const backupCollection = db.collection("deleted_etablissements_backup");
    const deletedEtablissements = await backupCollection.find({}).toArray();

    if (deletedEtablissements.length > 0) {
      await db.collection("etablissement").insertMany(deletedEtablissements);
    }

    const backupCount = await backupCollection.countDocuments({});
    if (backupCount === 0) {
      await backupCollection.drop();
    }
  },
};
