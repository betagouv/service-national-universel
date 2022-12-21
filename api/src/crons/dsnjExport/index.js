require("../../mongo");

const XLSX = require("xlsx");
const { capture } = require("../../sentry");
const slack = require("../../slack");
const CohortModel = require("../../models/cohort");
const SessionPhase1Model = require("../../models/sessionPhase1");
const CohesionCenterModel = require("../../models/cohesionCenter");
const YoungModel = require("../../models/young");
const { findCohesionCenterBySessionId, genderTranslation, situationTranslations, lookupTable, addToSlackRapport, printSlackInfo } = require("./utils");
const { uploadFile } = require("../../utils");
const { encrypt } = require("../../cryptoUtils");

const EXPORT_COHESION_CENTERS = "cohesionCenters";
const EXPORT_YOUNGS_BEFORE_SESSION = "youngsBeforeSession";
const EXPORT_YOUNGS_AFTER_SESSION = "youngsAfterSession";
const xlsxMimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const generateCohesionCentersExport = async (cohort) => {
  const sessions = await SessionPhase1Model.find({ cohort: cohort.name }).select({ cohesionCenterId: 1, _id: 0 });
  const cohesionCenterIds = sessions.map(({ cohesionCenterId }) => cohesionCenterId);
  const cohesionCenters = await CohesionCenterModel.find({ _id: { $in: cohesionCenterIds } }).select({
    _id: 1,
    name: 1,
    address: 1,
    city: 1,
    zip: 1,
    departmentCode: 1,
    department: 1,
    region: 1,
    placesTotal: 1,
  });
  const formattedCenters = cohesionCenters.map(({ _id, name, address, city, zip, departmentCode, department, region, placesTotal }) => ({
    "ID du centre": _id.toString(),
    Nom: name,
    Adresse: address,
    Ville: city,
    "Code Postal": zip,
    "N˚ Département": departmentCode,
    Département: department,
    Région: region,
    "Places totales": placesTotal,
  }));
  const worksheet = XLSX.utils.json_to_sheet(formattedCenters);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Liste Centre");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const encryptedBuffer = encrypt(buffer);
  const file = { mimetype: xlsxMimetype, encoding: "7bit", data: encryptedBuffer };
  await uploadFile(`dsnj/${cohort.snuId}/${EXPORT_COHESION_CENTERS}.xlsx`, file);
};

const generateYoungsExport = async (cohort, afterSession = false) => {
  const sessions = await SessionPhase1Model.find({ cohort: cohort.name }).select({ _id: 1, cohesionCenterId: 1 });
  const sessionIds = sessions.map(({ _id }) => _id);
  const cohesionCenterIds = sessions.map(({ cohesionCenterId }) => cohesionCenterId);
  const cohesionCenters = await CohesionCenterModel.find({ _id: { $in: cohesionCenterIds } }).select({ _id: 1, name: 1, code2022: 1 });
  const cohesionCenterParSessionId = {};
  const youngs = await YoungModel.find({ sessionPhase1Id: { $in: sessionIds }, status: { $in: ["VALIDATED", "WAITING_LIST"] } }).select({
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
    situation: 1,
    statusPhase1: 1,
    presenceJDM: 1,
  });

  const formattedYoungs = youngs.map(
    ({
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
      situation,
      statusPhase1,
      presenceJDM,
    }) => {
      const isFrench = frenchNationality === "true";
      const wasBornInFrance = birthCountry === "France";
      let cohesionCenter = cohesionCenterParSessionId[sessionPhase1Id];
      if (!cohesionCenter) {
        cohesionCenter = findCohesionCenterBySessionId(sessionPhase1Id, sessions, cohesionCenters);
        cohesionCenterParSessionId[sessionPhase1Id] = cohesionCenter;
      }
      return {
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
        "Téléphone volontaire": phone,
        "Statut professionnel": situationTranslations[situation] || situation,
        "Code du centre": cohesionCenter.code2022,
        "Libellé du centre": cohesionCenter.name,
        "Date début session": cohort.dateStart,
        'Validation séjour (validation phase 1 ET présence JDM "oui")': afterSession ? (statusPhase1 === "DONE" && presenceJDM === "true" ? "Oui" : "Non") : "null",
      };
    },
  );
  const worksheet1 = XLSX.utils.json_to_sheet(formattedYoungs);
  const worksheet2 = XLSX.utils.json_to_sheet(lookupTable);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet1, "Jeune", true);
  XLSX.utils.book_append_sheet(workbook, worksheet2, "Table de correspondance", true);
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const encryptedBuffer = encrypt(buffer);
  const file = { mimetype: xlsxMimetype, encoding: "7bit", data: encryptedBuffer };
  await uploadFile(`dsnj/${cohort.snuId}/${afterSession ? EXPORT_YOUNGS_AFTER_SESSION : EXPORT_YOUNGS_BEFORE_SESSION}.xlsx`, file);
};

exports.handler = async () => {
  try {
    const cohorts = await CohortModel.find({});
    const exportsGenerated = {};

    for (const cohort of cohorts) {
      const cohesionCenterExportDate = new Date(cohort.dsnjExportDates[EXPORT_COHESION_CENTERS]);
      const youngBeforeSessionExportDate = new Date(cohort.dsnjExportDates[EXPORT_YOUNGS_BEFORE_SESSION]);
      const youngAfterSessionExportDate = new Date(cohort.dsnjExportDates[EXPORT_YOUNGS_AFTER_SESSION]);
      const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
      const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

      if (cohesionCenterExportDate >= todayStart && cohesionCenterExportDate <= todayEnd) {
        await generateCohesionCentersExport(cohort);
        addToSlackRapport(exportsGenerated, cohort.name, EXPORT_COHESION_CENTERS);
      }
      if (youngBeforeSessionExportDate >= todayStart && youngBeforeSessionExportDate <= todayEnd) {
        await generateYoungsExport(cohort);
        addToSlackRapport(exportsGenerated, cohort.name, EXPORT_YOUNGS_BEFORE_SESSION);
      }
      if (youngAfterSessionExportDate >= todayStart && youngAfterSessionExportDate <= todayEnd) {
        await generateYoungsExport(cohort, true);
        addToSlackRapport(exportsGenerated, cohort.name, EXPORT_YOUNGS_AFTER_SESSION);
      }
    }

    await slack.info({
      title: "✅ DSNJ export generation",
      text: printSlackInfo(exportsGenerated),
    });
  } catch (e) {
    slack.error({ title: "DSNJ export generation", text: e });
    capture(e);
  }
};
