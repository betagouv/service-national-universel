const XLSX = require("xlsx");
const { getDepartmentNumber, getDepartureDate, PHONE_ZONES } = require("snu-lib");
const dayjs = require("dayjs");

const SessionPhase1Model = require("../../models/sessionPhase1");
const CohesionCenterModel = require("../../models/cohesionCenter");
const YoungModel = require("../../models/young");

const { uploadFile } = require("../../utils");
const { encrypt } = require("../../cryptoUtils");
import { capture } from "../../sentry";

const EXPORT_COHESION_CENTERS = "cohesionCenters";
const EXPORT_YOUNGS_BEFORE_SESSION = "youngsBeforeSession";
const EXPORT_YOUNGS_AFTER_SESSION = "youngsAfterSession";
const xlsxMimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const situationTranslations = {
  GENERAL_SCHOOL: "Scolarisé",
  PROFESSIONAL_SCHOOL: "Scolarisé",
  AGRICULTURAL_SCHOOL: "Scolarisé",
  SPECIALIZED_SCHOOL: "Scolarisé",
  APPRENTICESHIP: "Scolarisé",
  EMPLOYEE: "Actif",
  INDEPENDANT: "Actif",
  SELF_EMPLOYED: "Actif",
  ADAPTED_COMPANY: "Actif",
  POLE_EMPLOI: "En recherche d'emploi",
  MISSION_LOCALE: "En recherche d'emploi",
  CAP_EMPLOI: "En recherche d'emploi",
  NOTHING: "En recherche d'emploi",
};

const genderTranslation = {
  male: "Masculin",
  female: "Féminin",
};

const findCohesionCenterBySessionId = (sessionId, sessions, centers) => {
  const session = sessions.find(({ _id }) => {
    return _id.toString() === sessionId.toString();
  });
  if (!session) throw new Error("Session not found for ID: " + sessionId);
  return centers.find(({ _id }) => _id.toString() === session.cohesionCenterId.toString());
};

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

const generateCohesionCentersExport = async (cohort, action = "upload") => {
  const sessions = await SessionPhase1Model.find({ cohort: cohort.name }).select({ cohesionCenterId: 1, _id: 0 });
  const cohesionCenterIds = sessions.map(({ cohesionCenterId }) => cohesionCenterId);
  const cohesionCenters = await CohesionCenterModel.find({ _id: { $in: cohesionCenterIds } }).select({
    _id: 1,
    name: 1,
    address: 1,
    city: 1,
    zip: 1,
    department: 1,
    region: 1,
    placesTotal: 1,
  });
  const formattedCenters = cohesionCenters.map(({ _id, name, address, city, zip, department, region, placesTotal }) => ({
    "ID du centre": _id.toString(),
    Nom: name,
    Adresse: address,
    Ville: city,
    "Code Postal": zip,
    "N˚ Département": getDepartmentNumber(department),
    Département: department,
    Région: region,
    "Places totales": placesTotal,
  }));

  const fileName = `${EXPORT_COHESION_CENTERS}.xlsx`;
  const worksheet = XLSX.utils.json_to_sheet(formattedCenters);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Liste Centre");
  if (action === "upload") {
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const encryptedBuffer = encrypt(buffer);
    const file = { mimetype: xlsxMimetype, encoding: "7bit", data: encryptedBuffer };
    await uploadFile(`dsnj/${cohort.snuId}/${fileName}`, file);
  } else {
    XLSX.writeFile(workbook, fileName);
    console.log(`File ${fileName} generated`);
  }
};

const generateYoungsExport = async (cohort, afterSession = false, action = "upload") => {
  const sessions = await SessionPhase1Model.find({ cohort: cohort.name }).select({ _id: 1, cohesionCenterId: 1, dateStart: 1 });
  const cohesionCenterIds = sessions.map(({ cohesionCenterId }) => cohesionCenterId);
  const cohesionCenters = await CohesionCenterModel.find({ _id: { $in: cohesionCenterIds } }).select({ _id: 1, name: 1, code2022: 1 });
  const cohesionCenterParSessionId = {};
  const statusList = afterSession ? ["VALIDATED"] : ["WAITING_LIST", "VALIDATED"];
  const q = { cohort: cohort.name, status: { $in: statusList } };
  if (afterSession) q.frenchNationality = "true";
  const youngs = await YoungModel.find(q).select({
    _id: 1,
    sessionPhase1Id: 1,
    email: 1,
    frenchNationality: 1,
    lastName: 1,
    firstName: 1,
    gender: 1,
    birthdateAt: 1,
    birthCountry: 1,
    birthCity: 1,
    birthCityZip: 1,
    address: 1,
    complementAddress: 1,
    zip: 1,
    city: 1,
    phone: 1,
    phoneZone: 1,
    situation: 1,
    statusPhase1: 1,
    status: 1,
    cohort: 1,
    region: 1,
  });

  const formattedYoungs = [];
  for (const young of youngs) {
    const {
      _id,
      sessionPhase1Id,
      email,
      frenchNationality,
      lastName,
      firstName,
      gender,
      birthdateAt,
      birthCountry,
      birthCityZip,
      birthCity,
      address,
      complementAddress,
      zip,
      city,
      phone,
      phoneZone,
      situation,
      statusPhase1,
    } = young;

    const isFrench = frenchNationality === "true";
    const wasBornInFrance = birthCountry === "France";
    let cohesionCenter;
    if (sessionPhase1Id) {
      cohesionCenter = cohesionCenterParSessionId[sessionPhase1Id];
      if (!cohesionCenter) {
        cohesionCenter = findCohesionCenterBySessionId(sessionPhase1Id, sessions, cohesionCenters);
        cohesionCenterParSessionId[sessionPhase1Id] = cohesionCenter;
      }
    }

    const session = sessions.find(({ _id }) => _id.toString() === sessionPhase1Id);
    const departureDate = getDepartureDate(young, session, cohort);

    // fixme: this should not be necessary after general date harmonization
    departureDate.setHours(departureDate.getHours() + 2); // UTC+2

    const formattedYoung = {
      "Identifiant technique": _id.toString(),
      "Email du volontaire": email,
      Nationalité: isFrench ? "Française" : "Étrangère",
      "Nom volontaire": lastName,
      "Prénom(s) volontaire": firstName,
      "Sexe volontaire": genderTranslation[gender],
      "Date de naissance volontaire": birthdateAt,
      "Pays de naissance volontaire": birthCountry,
      "Code Postal naissance volontaire (si né en France)": wasBornInFrance ? birthCityZip : "",
      "Commune naissance volontaire (si né en France)": wasBornInFrance ? birthCity : "",
      "Ville de naissance volontaire(si né à l'étranger)": wasBornInFrance ? "" : birthCity,
      "Adresse volontaire": address,
      "Complément d’adresse 1 volontaire": complementAddress,
      "Code Postal volontaire": zip,
      "Commune volontaire": city,
      "Téléphone volontaire": phoneZone ? `${PHONE_ZONES[phoneZone].code} ${phone}` : phone,
      "Statut professionnel": situationTranslations[situation] || situation,
      "ID du centre": cohesionCenter ? cohesionCenter._id.toString() : "",
      "Libellé du centre": cohesionCenter ? cohesionCenter.name : "",
      "Date début session": dayjs(departureDate).locale("fr-FR").format("D/M/YYYY"),
      "Validation séjour (Validation phase 1)": afterSession ? (statusPhase1 === "DONE" ? "Oui" : "Non") : "null",
    };

    formattedYoungs.push(formattedYoung);
  }

  const fileName = `${afterSession ? EXPORT_YOUNGS_AFTER_SESSION : EXPORT_YOUNGS_BEFORE_SESSION}.xlsx`;
  const worksheet1 = XLSX.utils.json_to_sheet(formattedYoungs);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet1, "Jeune", true);
  if (action === "upload") {
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const encryptedBuffer = encrypt(buffer);
    const file = { mimetype: xlsxMimetype, encoding: "7bit", data: encryptedBuffer };
    await uploadFile(`dsnj/${cohort.snuId}/${fileName}`, file);
  } else {
    XLSX.writeFile(workbook, fileName);
    console.log(`File ${fileName} generated`);
  }
};

module.exports = {
  situationTranslations,
  genderTranslation,
  findCohesionCenterBySessionId,
  addToSlackRapport,
  printSlackInfo,
  generateCohesionCentersExport,
  generateYoungsExport,
};
