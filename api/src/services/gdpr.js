const YoungModel = require("../Infrastructure/Databases/Mongo/Models/young");
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

module.exports = {
  deleteSensitiveData,
};
