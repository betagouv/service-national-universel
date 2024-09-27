process.env.NODE_CONFIG_DIR = "../../../config";

const XLSX = require("xlsx");
const { getAge, translate, translateColoration } = require("snu-lib");

const { EtablissementModel, ClasseModel, YoungModel, SessionPhase1Model, CohortModel } = require("../../../src/models");

const { uploadFile } = require("../../../src/utils");
const { encrypt } = require("../../../src/cryptoUtils");
const { logger } = require("../../../src/logger");

const EXPORT_YOUNGS_BEFORE_SESSION = "youngsBeforeSession";
const EXPORT_YOUNGS_AFTER_SESSION = "youngsAfterSession";
const xlsxMimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const addToSlackRapport = (rapport, sessionName, exportKey) => {
  if (rapport[sessionName]) {
    rapport[sessionName].push(exportKey);
  } else {
    rapport[sessionName] = [exportKey];
  }
};

const printSlackInfo = (rapport) => {
  if (Object.keys(rapport).length === 0) {
    return "Pas d'export généré";
  }
  return Object.keys(rapport).reduce((previous, current) => {
    return `${previous ? `${previous}, ` : previous}${current}: ${rapport[current].join(", ")}`;
  }, "");
};

const generateYoungsExport = async (cohortName, afterSession = false, action = "upload") => {
  console.log("Début de l'export");
  console.time("export_injep");

  const cohort = await CohortModel.findOne({ name: cohortName });
  if (!cohort) {
    console.error(`Cohorte ${cohortName} non trouvée`);
    return;
  }

  let result = [];
  const q = { cohort: cohortName, status: "VALIDATED" };
  if (afterSession) {
    q.statusPhase1 = { $in: ["DONE", "NOT_DONE"] };
  }

  const youngs = await YoungModel.find(q).lean();

  const sessionPhase1Ids = [...new Set(youngs.map((young) => young.sessionPhase1Id))];
  const sessionsPhase1 = await SessionPhase1Model.find({ _id: { $in: sessionPhase1Ids } }).lean();
  const sessionsPhase1Map = new Map(sessionsPhase1.map((session) => [`${session._id}`, session]));

  const etablissementIds = [...new Set(youngs.filter((young) => young.source === "CLE").map((young) => young.etablissementId))];
  const etablissements = await EtablissementModel.find({ _id: { $in: etablissementIds } }).lean();
  const etablissementsMap = new Map(etablissements.map((etablissement) => [`${etablissement._id}`, etablissement]));

  const classeIds = [...new Set(youngs.filter((young) => young.source === "CLE").map((young) => young.classeId))];
  const classes = await ClasseModel.find({ _id: { $in: classeIds } }).lean();
  const classesMap = new Map(classes.map((classe) => [`${classe._id}`, classe]));

  for (let young of youngs) {
    console.log(young.sessionPhase1Id);
    const session = sessionsPhase1Map.get(young.sessionPhase1Id);
    if (!session) {
      console.log("Session not found", young._id);
      continue;
    }
    let data = {
      Nom: young.lastName,
      Prénom: young.firstName,
      "Adresse mail": young.email,
      "Numéro de téléphone": young.phone,
      "Présence à l'arrivée": young.cohesionStayPresence ? (young.cohesionStayPresence === "true" ? "Présent" : "Absent") : "Non renseigné",
      "Départ renseigné": young.departInform || "",
      "Motif du départ": young.departSejourMotif || "",
      "Statut de la phase 1": translate(young.statusPhase1),
      Sexe: translate(young.gender),
      Age: getAge(young.birthdateAt),
      Situation: translate(young.situation),
      "Situation de handicap": young.handicap === "true" ? "Oui" : "Non",
      QPV: young.qpv ? (young.qpv === "true" ? "Oui" : "Non") : "Non renseigné",
      "Département de résidence": young.department,
      "Région de résidence": young.region,
      "Département du centre": session.department,
      "Région du centre": session.region,
      "Nom du centre": session.nameCentre,
      "Code du centre": session.codeCentre,
      "Ville du centre": session.cityCentre,
      "Code postale du centre": session.zipCentre,
      "Elève CLE": young.source === "CLE" ? "Oui" : "Non",
      "Nom de l'établissement": "",
      "Code établissement CLE": "",
      "Département établissement CLE": "",
      "Région établissement CLE": "",
      "Coloration CLE": "",
    };

    if (young.source === "CLE") {
      const etablissement = etablissementsMap.get(young.etablissementId);
      const classe = classesMap.get(young.classeId);
      if (etablissement && classe) {
        data = {
          ...data,
          Situation: translate(classe.filiere),
          "Nom de l'établissement": etablissement.name,
          "Code établissement CLE": etablissement.uai,
          "Département établissement CLE": etablissement.department,
          "Région établissement CLE": etablissement.region,
          "Coloration CLE": translateColoration(classe.coloration),
        };
      }
    }
    result.push(data);
  }

  const workbook = XLSX.utils.book_new();
  const worksheet1 = XLSX.utils.json_to_sheet(result, { defval: "" });
  XLSX.utils.book_append_sheet(workbook, worksheet1, "jeune");

  const fileName = `${afterSession ? EXPORT_YOUNGS_AFTER_SESSION : EXPORT_YOUNGS_BEFORE_SESSION}.xlsx`;

  if (action === "upload") {
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const encryptedBuffer = encrypt(buffer);
    const file = { mimetype: xlsxMimetype, encoding: "7bit", data: encryptedBuffer };
    await uploadFile(`injep/${cohort.snuId}/${fileName}`, file);

    logger.info(`Fichier ${fileName} uploadé sur S3`);
  } else {
    // Écrire le fichier localement
    XLSX.writeFile(workbook, fileName);
    console.log(`Fichier ${fileName} généré localement`);
  }

  console.timeEnd("export_injep");
};

module.exports = {
  generateYoungsExport,
  addToSlackRapport,
  printSlackInfo,
};
