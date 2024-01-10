const YoungModel = require("../models/young");
const CohortModel = require("../models/cohort");
const { deleteFilesByList, listFiles } = require("../utils/index");

async function deleteSensitiveData(youngId, mode = "save") {
  const young = await YoungModel.findById(youngId);
  const copyOfYoung = JSON.parse(JSON.stringify(young));
  let fileStatus = "";

  try {
    const res = await listFiles(`app/young/${young._id}/cniFiles/`);
    const CNIFileArray = res.map((e) => {
      return { Key: e.Key };
    });
    console.log("Deleting files: ", CNIFileArray);
    await deleteFilesByList(CNIFileArray);
    fileStatus = "DELETED";
  } catch (error) {
    fileStatus = "NOT_FOUND";
    console.log(error);
  }

  young.set({ latestCNIFileExpirationDate: null, latestCNIFileCategory: "deleted", cniFiles: [], "files.cniFiles": [] });
  if (young.specificAmenagment === "true") young.set({ specificAmenagmentType: "Contenu supprimé" });

  if (mode === "save") {
    await young.save({ fromUser: { firstName: "Script de suppression des champs: Nature de l'aménagement spécifique, carte nationale d'identité" } });
  }
  return { young, copyOfYoung, fileStatus };
}

async function getCohortsFinishedSinceYesterday() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999); // Inclure toute la journée d'hier

  const finishedCohorts = await CohortModel.find({
    dateEnd: { $lte: yesterday },
  }).select("name"); // Sélectionner seulement le nom de la cohorte

  return finishedCohorts.map((cohort) => cohort.name);
}

module.exports = {
  deleteSensitiveData,
  getCohortsFinishedSinceYesterday,
};
