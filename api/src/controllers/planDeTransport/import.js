const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const Joi = require("joi");
const { canSendPlanDeTransport, MIME_TYPES, PDT_IMPORT_ERRORS, departmentLookUp } = require("snu-lib");
const FileType = require("file-type");
const fs = require("fs");
const config = require("../../config");
const { parse: parseDate } = require("date-fns");
const XLSX = require("xlsx");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const CohesionCenterModel = require("../../models/cohesionCenter");
const PdrModel = require("../../models/PlanDeTransport/pointDeRassemblement");
const ImportPlanTransportModel = require("../../models/PlanDeTransport/importPlanTransport");
const LigneBusModel = require("../../models/PlanDeTransport/ligneBus");
const SessionPhase1Model = require("../../models/sessionPhase1");
const LigneToPointModel = require("../../models/PlanDeTransport/ligneToPoint");
const PlanTransportModel = require("../../models/PlanDeTransport/planTransport");
const scanFile = require("../../utils/virusScanner");

function isValidDate(date) {
  return date.match(/^[0-9]{2}\/[0-9]{2}\/202[0-9]$/);
}

function formatTime(time) {
  let [hours, minutes] = time.split(":");
  hours = hours.length === 1 ? "0" + hours : hours;
  return `${hours}:${minutes}`;
}

function isValidTime(time) {
  const test = formatTime(time);
  console.log(test);
  return test.match(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/);
}

function isValidNumber(number) {
  return number.match(/^[0-9]+$/);
}

function isValidBoolean(b) {
  return b
    .trim()
    .toLowerCase()
    .match(/^(oui|non)$/);
}

function isValidDepartment(department) {
  const ids = Object.keys(departmentLookUp);
  return ids.includes((department || "").toUpperCase());
}

// Vérifie un plan de transport importé et l'enregistre dans la collection importplandetransport.
router.post(
  "/:cohortName",
  passport.authenticate("referent", { session: false, failWithError: true }),
  fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req, res) => {
    try {
      const { error, value } = Joi.object({
        cohortName: Joi.string().required(),
      }).validate(req.params, { stripUnknown: true });
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      const { cohortName: cohort } = value;

      const files = Object.values(req.files);
      if (files.length === 0) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
      const file = files[0];

      if (!canSendPlanDeTransport(req.user)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      const { name, tempFilePath, mimetype } = file;
      const filetype = await FileType.fromFile(tempFilePath);
      const mimeFromMagicNumbers = filetype ? filetype.mime : MIME_TYPES.EXCEL;
      const validTypes = [MIME_TYPES.EXCEL];
      if (!(validTypes.includes(mimetype) && validTypes.includes(mimeFromMagicNumbers))) {
        fs.unlinkSync(tempFilePath);
        return res.status(500).send({ ok: false, code: "UNSUPPORTED_TYPE" });
      }

        const scanResult = await scanFile(tempFilePath, name, req.user.id);
        if (scanResult.infected) {
          return res.status(403).send({ ok: false, code: ERRORS.FILE_INFECTED });
        } else if (scanResult.error) {
          return res.status(500).send({ ok: false, code: scanResult.error });
        }

      const workbook = XLSX.readFile(tempFilePath);
      const worksheet = workbook.Sheets["ALLER-RETOUR"];
      const lines = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null });

      if (lines.length < 1) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }

      // Count columns that start with "ID PDR" to know how many PDRs there are.
      const countPdr = Object.keys(lines[0]).filter((e) => e.startsWith("ID PDR")).length;

      const errors = {
        "NUMERO DE LIGNE": [],
        "DATE DE TRANSPORT ALLER": [],
        "DATE DE TRANSPORT RETOUR": [],
        ...Array.from({ length: countPdr }, (_, i) => ({
          [`N° DE DEPARTEMENT PDR ${i + 1}`]: [],
          [`ID PDR ${i + 1}`]: [],
          [`TYPE DE TRANSPORT PDR ${i + 1}`]: [],
          [`NOM + ADRESSE DU PDR ${i + 1}`]: [],
          [`HEURE ALLER ARRIVÉE AU PDR ${i + 1}`]: [],
          [`HEURE DEPART DU PDR ${i + 1}`]: [],
          [`HEURE DE RETOUR ARRIVÉE AU PDR ${i + 1}`]: [],
        })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),
        "N° DU DEPARTEMENT DU CENTRE": [],
        "ID CENTRE": [],
        "NOM + ADRESSE DU CENTRE": [],
        "HEURE D'ARRIVEE AU CENTRE": [],
        "HEURE DE DÉPART DU CENTRE": [],
        "TOTAL ACCOMPAGNATEURS": [],
        "CAPACITÉ VOLONTAIRE TOTALE": [],
        "CAPACITE TOTALE LIGNE": [],
        "PAUSE DÉJEUNER ALLER": [],
        "PAUSE DÉJEUNER RETOUR": [],
        "TEMPS DE ROUTE": [],
      };

      const FIRST_LINE_NUMBER_IN_EXCEL = 2;

      //Check columns names
      const columns = Object.keys(lines[0]);
      const expectedColumns = Object.keys(errors);
      const missingColumns = expectedColumns.filter((e) => !columns.includes(e));

      if (missingColumns.length) {
        missingColumns.forEach((e) => {
          errors[e].push({ line: 1, error: PDT_IMPORT_ERRORS.MISSING_COLUMN });
        });
        console.log("errors", errors);
        return res.status(200).send({ ok: false, code: ERRORS.INVALID_BODY, errors });
      }

      // Format errors.
      // Check format, add errors for each line
      for (const [i, line] of lines.entries()) {
        // We need to have the "line number" as of the excel file, so we add 2 to the index.
        const index = i + FIRST_LINE_NUMBER_IN_EXCEL;
        if (!line["NUMERO DE LIGNE"]) {
          errors["NUMERO DE LIGNE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
        }
        if (line["NUMERO DE LIGNE"] && !line["NUMERO DE LIGNE"]?.length) {
          errors["NUMERO DE LIGNE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
        }
        if (!line["DATE DE TRANSPORT ALLER"]) {
          errors["DATE DE TRANSPORT ALLER"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
        }
        if (line["DATE DE TRANSPORT ALLER"] && !isValidDate(line["DATE DE TRANSPORT ALLER"])) {
          errors["DATE DE TRANSPORT ALLER"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
        }
        if (!line["DATE DE TRANSPORT RETOUR"]) {
          errors["DATE DE TRANSPORT RETOUR"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
        }
        if (line["DATE DE TRANSPORT RETOUR"] && !isValidDate(line["DATE DE TRANSPORT RETOUR"])) {
          errors["DATE DE TRANSPORT RETOUR"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
        }

        // Check each PDR
        for (let i = 1; i <= countPdr; i++) {
          // Skip empty PDR
          if (i > 1 && !line[`ID PDR ${i}`]) continue;

          if (!line[`N° DE DEPARTEMENT PDR ${i}`]) {
            errors[`N° DE DEPARTEMENT PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
          }
          if (line[`N° DE DEPARTEMENT PDR ${i}`] && !isValidDepartment(line[`N° DE DEPARTEMENT PDR ${i}`])) {
            errors[`N° DE DEPARTEMENT PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.UNKNOWN_DEPARTMENT, extra: line[`N° DE DEPARTEMENT PDR ${i}`] });
          }
          if (!line[`ID PDR ${i}`]) {
            errors[`ID PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
          }
          if (line[`ID PDR ${i}`]) {
            const isValidObjectId = mongoose.Types.ObjectId.isValid(line[`ID PDR ${i}`]);
            const isValidCorrespondance = i > 1 && ["correspondance aller", "correspondance retour", "correspondance"].includes(line[`ID PDR ${i}`].toLowerCase());
            if (!(isValidObjectId || isValidCorrespondance)) {
              errors[`ID PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
            }
          }
          if (!line[`TYPE DE TRANSPORT PDR ${i}`]) {
            errors[`TYPE DE TRANSPORT PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
          }
          if (line[`TYPE DE TRANSPORT PDR ${i}`] && !["bus", "train", "avion"].includes(line[`TYPE DE TRANSPORT PDR ${i}`].toLowerCase())) {
            errors[`TYPE DE TRANSPORT PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.UNKNOWN_TRANSPORT_TYPE, extra: line[`TYPE DE TRANSPORT PDR ${i}`] });
          }
          if (!line[`NOM + ADRESSE DU PDR ${i}`]) {
            errors[`NOM + ADRESSE DU PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
          }
          if (line[`NOM + ADRESSE DU PDR ${i}`] && !line[`NOM + ADRESSE DU PDR ${i}`]?.length) {
            errors[`NOM + ADRESSE DU PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
          }
          if (!line[`HEURE ALLER ARRIVÉE AU PDR ${i}`]) {
            errors[`HEURE ALLER ARRIVÉE AU PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
          }
          if (line[`HEURE ALLER ARRIVÉE AU PDR ${i}`] && !isValidTime(line[`HEURE ALLER ARRIVÉE AU PDR ${i}`])) {
            errors[`HEURE ALLER ARRIVÉE AU PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
          }
          if (!line[`HEURE DEPART DU PDR ${i}`] && (line[`ID PDR ${i}`] || "").toLowerCase() !== "correspondance retour") {
            errors[`HEURE DEPART DU PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
          }
          if (line[`HEURE DEPART DU PDR ${i}`] && !isValidTime(line[`HEURE DEPART DU PDR ${i}`])) {
            errors[`HEURE DEPART DU PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
          }
          if (!line[`HEURE DE RETOUR ARRIVÉE AU PDR ${i}`] && (line[`ID PDR ${i}`] || "").toLowerCase() !== "correspondance aller") {
            errors[`HEURE DE RETOUR ARRIVÉE AU PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
          }
          if (line[`HEURE DE RETOUR ARRIVÉE AU PDR ${i}`] && !isValidTime(line[`HEURE DE RETOUR ARRIVÉE AU PDR ${i}`])) {
            errors[`HEURE DE RETOUR ARRIVÉE AU PDR ${i}`].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
          }
        }
        if (!line["N° DU DEPARTEMENT DU CENTRE"]) {
          errors["N° DU DEPARTEMENT DU CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
        }
        if (line["N° DU DEPARTEMENT DU CENTRE"] && !isValidDepartment(line["N° DU DEPARTEMENT DU CENTRE"])) {
          errors["N° DU DEPARTEMENT DU CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.UNKNOWN_DEPARTMENT });
        }
        if (!line["ID CENTRE"]) {
          errors["ID CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
        }
        if (line["ID CENTRE"] && !mongoose.Types.ObjectId.isValid(line["ID CENTRE"])) {
          errors["ID CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
        }
        if (!line["NOM + ADRESSE DU CENTRE"]) {
          errors["NOM + ADRESSE DU CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
        }
        if (line["NOM + ADRESSE DU CENTRE"] && !line["NOM + ADRESSE DU CENTRE"]?.length) {
          errors["NOM + ADRESSE DU CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
        }
        if (!line["HEURE D'ARRIVEE AU CENTRE"]) {
          errors["HEURE D'ARRIVEE AU CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
        }
        if (line["HEURE D'ARRIVEE AU CENTRE"] && !isValidTime(line["HEURE D'ARRIVEE AU CENTRE"])) {
          errors["HEURE D'ARRIVEE AU CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
        }
        if (!line["HEURE DE DÉPART DU CENTRE"]) {
          errors["HEURE DE DÉPART DU CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
        }
        if (line["HEURE DE DÉPART DU CENTRE"] && !isValidTime(line["HEURE DE DÉPART DU CENTRE"])) {
          errors["HEURE DE DÉPART DU CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
        }
        if (!line["TOTAL ACCOMPAGNATEURS"]) {
          errors["TOTAL ACCOMPAGNATEURS"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
        }
        if (line["TOTAL ACCOMPAGNATEURS"] && !isValidNumber(line["TOTAL ACCOMPAGNATEURS"])) {
          errors["TOTAL ACCOMPAGNATEURS"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
        }
        if (!line["CAPACITÉ VOLONTAIRE TOTALE"]) {
          errors["CAPACITÉ VOLONTAIRE TOTALE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
        }
        if (line["CAPACITÉ VOLONTAIRE TOTALE"] && !isValidNumber(line["CAPACITÉ VOLONTAIRE TOTALE"])) {
          errors["CAPACITÉ VOLONTAIRE TOTALE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
        }
        if (!line["CAPACITE TOTALE LIGNE"]) {
          errors["CAPACITE TOTALE LIGNE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
        }
        if (line["CAPACITE TOTALE LIGNE"] && !isValidNumber(line["CAPACITE TOTALE LIGNE"])) {
          errors["CAPACITE TOTALE LIGNE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
        }
        if (!line["PAUSE DÉJEUNER ALLER"]) {
          errors["PAUSE DÉJEUNER ALLER"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
        }
        if (line["PAUSE DÉJEUNER ALLER"] && !isValidBoolean(line["PAUSE DÉJEUNER ALLER"])) {
          errors["PAUSE DÉJEUNER ALLER"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
        }
        if (!line["PAUSE DÉJEUNER RETOUR"]) {
          errors["PAUSE DÉJEUNER RETOUR"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
        }
        if (line["PAUSE DÉJEUNER RETOUR"] && !isValidBoolean(line["PAUSE DÉJEUNER RETOUR"])) {
          errors["PAUSE DÉJEUNER RETOUR"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
        }
        if (!line["TEMPS DE ROUTE"]) {
          errors["TEMPS DE ROUTE"].push({ line: index, error: PDT_IMPORT_ERRORS.MISSING_DATA });
        }
        if (line["TEMPS DE ROUTE"] && !isValidTime(line["TEMPS DE ROUTE"])) {
          errors["TEMPS DE ROUTE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_FORMAT });
        }
      }

      // Coherence errors.
      // Check "CAPACITE TOTALE LIGNE" = "TOTAL ACCOMPAGNATEURS" + "CAPACITÉ VOLONTAIRE TOTALE"
      for (const [i, line] of lines.entries()) {
        const index = i + FIRST_LINE_NUMBER_IN_EXCEL;
        if (line["TOTAL ACCOMPAGNATEURS"] && line["CAPACITÉ VOLONTAIRE TOTALE"] && line["CAPACITE TOTALE LIGNE"]) {
          const totalAccompagnateurs = parseInt(line["TOTAL ACCOMPAGNATEURS"]);
          const capaciteVolontaireTotale = parseInt(line["CAPACITÉ VOLONTAIRE TOTALE"]);
          const capaciteTotaleLigne = parseInt(line["CAPACITE TOTALE LIGNE"]);
          if (totalAccompagnateurs + capaciteVolontaireTotale !== capaciteTotaleLigne) {
            errors["CAPACITE TOTALE LIGNE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_TOTAL_CAPACITY });
          }
        }
      }
      // Check duplicate "NUMERO DE LIGNE"
      const duplicateLines = lines.reduce((acc, line) => {
        if (line["NUMERO DE LIGNE"]) {
          acc[line["NUMERO DE LIGNE"]] = (acc[line["NUMERO DE LIGNE"]] || 0) + 1;
        }
        return acc;
      }, {});
      for (const [i, line] of lines.entries()) {
        const index = i + FIRST_LINE_NUMBER_IN_EXCEL;
        if (line["NUMERO DE LIGNE"] && duplicateLines[line["NUMERO DE LIGNE"]] > 1) {
          errors["NUMERO DE LIGNE"].push({ line: index, error: PDT_IMPORT_ERRORS.DOUBLON_BUSNUM, extra: line["NUMERO DE LIGNE"] });
        }
      }
      // Check if "ID CENTRE" exists in DB
      for (const [i, line] of lines.entries()) {
        const index = i + FIRST_LINE_NUMBER_IN_EXCEL;
        if (line["ID CENTRE"] && mongoose.Types.ObjectId.isValid(line["ID CENTRE"])) {
          const center = await CohesionCenterModel.findById(line["ID CENTRE"]);
          if (!center) {
            errors["ID CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_CENTER_ID, extra: line["ID CENTRE"] });
          }
          const session = await SessionPhase1Model.findOne({ cohort, cohesionCenterId: line["ID CENTRE"] });
          if (!session) {
            errors["ID CENTRE"].push({ line: index, error: PDT_IMPORT_ERRORS.CENTER_WITHOUT_SESSION, extra: line["ID CENTRE"] });
          }
        }
      }
      // Check if `ID PDR ${i}` exists in DB, and if departement is the same as the PDR.
      for (const [i, line] of lines.entries()) {
        const index = i + FIRST_LINE_NUMBER_IN_EXCEL;
        for (let pdrNumber = 1; pdrNumber <= countPdr; pdrNumber++) {
          if (line[`ID PDR ${pdrNumber}`]) {
            if (mongoose.Types.ObjectId.isValid(line[`ID PDR ${pdrNumber}`])) {
              const pdr = await PdrModel.findOne({ _id: line[`ID PDR ${pdrNumber}`], deletedAt: { $exists: false } });
              if (!pdr) {
                errors[`ID PDR ${pdrNumber}`].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_PDR_ID, extra: line[`ID PDR ${pdrNumber}`] });
              } else if ((pdr?.department || "").toLowerCase() !== departmentLookUp[line[`N° DE DEPARTEMENT PDR ${pdrNumber}`]]?.toLowerCase()) {
                errors[`ID PDR ${pdrNumber}`].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_PDR_DEPARTEMENT, extra: line[`ID PDR ${pdrNumber}`] });
              }
            } else if (!["correspondance aller", "correspondance retour", "correspondance"].includes(line[`ID PDR ${pdrNumber}`]?.toLowerCase())) {
              errors[`ID PDR ${pdrNumber}`].push({ line: index, error: PDT_IMPORT_ERRORS.BAD_PDR_ID, extra: line[`ID PDR ${pdrNumber}`] });
            }
          }
        }
      }
      // Check if there is a PDR duplicate in a line
      for (const [i, line] of lines.entries()) {
        const index = i + FIRST_LINE_NUMBER_IN_EXCEL;
        const pdrIds = [];
        for (let pdrNumber = 1; pdrNumber <= countPdr; pdrNumber++) {
          if (line[`ID PDR ${pdrNumber}`] && !["correspondance aller", "correspondance retour", "correspondance"].includes(line[`ID PDR ${pdrNumber}`]?.toLowerCase())) {
            pdrIds.push(line[`ID PDR ${pdrNumber}`]);
          }
        }
        //check and return duplicate pdr
        for (let pdrNumber = 1; pdrNumber <= countPdr; pdrNumber++) {
          if (line[`ID PDR ${pdrNumber}`] && pdrIds.filter((pdrId) => pdrId === line[`ID PDR ${pdrNumber}`]).length > 1) {
            errors[`ID PDR ${pdrNumber}`].push({ line: index, error: PDT_IMPORT_ERRORS.SAME_PDR_ON_LINE, extra: line[`ID PDR ${pdrNumber}`] });
          }
        }
      }

      // Count total unique centers
      const centers = lines.reduce((acc, line) => {
        if (line["ID CENTRE"]) {
          acc[line["ID CENTRE"]] = (acc[line["ID CENTRE"]] || 0) + parseInt(line["CAPACITÉ VOLONTAIRE TOTALE"]);
        }
        return acc;
      }, {});

      const hasError = Object.values(errors).some((error) => error.length > 0);

      if (hasError) {
        res.status(200).send({ ok: false, code: ERRORS.INVALID_BODY, errors });
      } else {
        // Count total unique PDR
        const pdrCount = lines.reduce((acc, line) => {
          for (let i = 1; i <= countPdr; i++) {
            if (line[`ID PDR ${i}`] && !acc.includes(line[`ID PDR ${i}`]) && mongoose.Types.ObjectId.isValid(line[`ID PDR ${i}`])) {
              acc.push(line[`ID PDR ${i}`]);
            }
          }
          return acc;
        }, []).length;
        // Save import plan
        const { _id } = await ImportPlanTransportModel.create({ cohort, lines });
        // Send response (summary)
        res.status(200).send({ ok: true, data: { cohort, busLineCount: lines.length, centerCount: Object.keys(centers).length, pdrCount, _id } });
      }
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

// Importe un plan de transport vérifié et enregistré dans importplandetransport.
router.post("/:importId/execute", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    const { error, value } = Joi.object({
      importId: Joi.string().required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { importId } = value;

    const importData = await ImportPlanTransportModel.findById(importId);
    if (!importData) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    if (!canSendPlanDeTransport(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    const lines = importData.lines;
    const countPdr = Object.keys(lines[0]).filter((e) => e.startsWith("ID PDR")).length;

    for (const line of importData.lines) {
      const pdrIds = [];
      for (let pdrNumber = 1; pdrNumber <= countPdr; pdrNumber++) {
        if (line[`ID PDR ${pdrNumber}`] && !["correspondance aller", "correspondance retour", "correspondance"].includes(line[`ID PDR ${pdrNumber}`]?.toLowerCase())) {
          pdrIds.push(line[`ID PDR ${pdrNumber}`]);
        }
      }

      const session = await SessionPhase1Model.findOne({ cohort: importData.cohort, cohesionCenterId: line["ID CENTRE"] });
      const busLineData = {
        cohort: importData.cohort,
        busId: line["NUMERO DE LIGNE"],
        departuredDate: parseDate(line["DATE DE TRANSPORT ALLER"], "dd/MM/yyyy", new Date()),
        returnDate: parseDate(line["DATE DE TRANSPORT RETOUR"], "dd/MM/yyyy", new Date()),
        centerId: line["ID CENTRE"],
        centerArrivalTime: formatTime(line["HEURE D'ARRIVEE AU CENTRE"]),
        centerDepartureTime: formatTime(line["HEURE DE DÉPART DU CENTRE"]),
        followerCapacity: line["TOTAL ACCOMPAGNATEURS"],
        youngCapacity: line["CAPACITÉ VOLONTAIRE TOTALE"],
        totalCapacity: line["CAPACITE TOTALE LIGNE"],
        youngSeatsTaken: 0,
        lunchBreak: (line["PAUSE DÉJEUNER ALLER"] || "").toLowerCase() === "oui",
        lunchBreakReturn: line["PAUSE DÉJEUNER RETOUR" || ""].toLowerCase() === "oui",
        travelTime: formatTime(line["TEMPS DE ROUTE"]),
        sessionId: session?._id.toString(),
        meetingPointsIds: pdrIds,
      };
      const newBusLine = new LigneBusModel(busLineData);
      const busLine = await newBusLine.save();

      const lineToPointWithCorrespondance = Array.from({ length: countPdr }, (_, i) => i + 1).reduce((acc, pdrNumber) => {
        if (pdrNumber > 1 && !line[`ID PDR ${pdrNumber}`]) return acc;
        if (!["correspondance aller", "correspondance retour", "correspondance"].includes(line[`ID PDR ${pdrNumber}`].toLowerCase())) {
          acc.push({
            lineId: busLine._id.toString(),
            meetingPointId: line[`ID PDR ${pdrNumber}`],
            transportType: line[`TYPE DE TRANSPORT PDR ${pdrNumber}`].toLowerCase(),
            busArrivalHour: formatTime(line[`HEURE ALLER ARRIVÉE AU PDR ${pdrNumber}`]),
            departureHour: formatTime(line[`HEURE DEPART DU PDR ${pdrNumber}`]),
            meetingHour: getPDRMeetingHour(formatTime(line[`HEURE DEPART DU PDR ${pdrNumber}`])),
            returnHour: formatTime(line[`HEURE DE RETOUR ARRIVÉE AU PDR ${pdrNumber}`]),
            stepPoints: [],
          });
        } else {
          if (line[`ID PDR ${pdrNumber}`].toLowerCase() === "correspondance") {
            // Special case: when correspondance is not aller or retour
            // We create 2 step points (aller and retour).
            acc[acc.length - 1].stepPoints.push({
              type: "aller",
              address: line[`NOM + ADRESSE DU PDR ${pdrNumber}`],
              departureHour: formatTime(line[`HEURE DEPART DU PDR ${pdrNumber}`]),
              returnHour: "",
              transportType: line[`TYPE DE TRANSPORT PDR ${pdrNumber}`].toLowerCase(),
            });
            acc[acc.length - 1].stepPoints.push({
              type: "retour",
              address: line[`NOM + ADRESSE DU PDR ${pdrNumber}`],
              departureHour: "",
              returnHour: formatTime(line[`HEURE DE RETOUR ARRIVÉE AU PDR ${pdrNumber}`]),
              transportType: line[`TYPE DE TRANSPORT PDR ${pdrNumber}`].toLowerCase(),
            });
          } else {
            acc[acc.length - 1].stepPoints.push({
              type: line[`ID PDR ${pdrNumber}`].toLowerCase() === "correspondance aller" ? "aller" : "retour",
              address: line[`NOM + ADRESSE DU PDR ${pdrNumber}`],
              departureHour: line[`ID PDR ${pdrNumber}`].toLowerCase() === "correspondance aller" ? formatTime(line[`HEURE DEPART DU PDR ${pdrNumber}`]) : "",
              returnHour: line[`ID PDR ${pdrNumber}`].toLowerCase() === "correspondance aller" ? "" : formatTime(line[`HEURE DE RETOUR ARRIVÉE AU PDR ${pdrNumber}`]),
              transportType: line[`TYPE DE TRANSPORT PDR ${pdrNumber}`].toLowerCase(),
            });
          }
        }
        return acc;
      }, []);

      for (const lineToPoint of lineToPointWithCorrespondance) {
        const newLineToPoint = new LigneToPointModel(lineToPoint);
        await newLineToPoint.save();
      }

      // * Update slave PlanTransport
      const center = await CohesionCenterModel.findById(busLine.centerId);
      let pointDeRassemblements = [];
      for (let i = 0, n = lineToPointWithCorrespondance.length; i < n; ++i) {
        const ltp = lineToPointWithCorrespondance[i];
        const pdr = await PdrModel.findById(ltp.meetingPointId);
        if (pdr) {
          pointDeRassemblements.push({
            ...pdr.toObject(),
            meetingPointId: ltp.meetingPointId,
            busArrivalHour: ltp.busArrivalHour,
            meetingHour: ltp.meetingHour,
            departureHour: ltp.departureHour,
            returnHour: ltp.returnHour,
            transportType: ltp.transportType,
          });
        }
      }
      await PlanTransportModel.create({
        _id: busLine._id,
        cohort: busLine.cohort,
        busId: busLine.busId,
        departureString: busLine.departuredDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
        returnString: busLine.returnDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
        youngCapacity: busLine.youngCapacity,
        totalCapacity: busLine.totalCapacity,
        lineFillingRate: 0,
        followerCapacity: busLine.followerCapacity,
        travelTime: busLine.travelTime,
        lunchBreak: busLine.lunchBreak,
        lunchBreakReturn: busLine.lunchBreakReturn,
        centerId: busLine.centerId,
        centerRegion: center?.region,
        centerDepartment: center?.department,
        centerZip: center?.zip,
        centerAddress: center?.address,
        centerName: center?.name,
        centerCode: center?.code2022,
        centerArrivalTime: busLine.centerArrivalTime,
        centerDepartureTime: busLine.centerDepartureTime,
        pointDeRassemblements,
      });
      // * End update slave PlanTransport
    }

    res.status(200).send({ ok: true, data: lines.length });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

// Remove 30 mins to departure hour
function getPDRMeetingHour(departureHour) {
  const [hour, minute] = departureHour.split(":");
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(0);
  date.setMilliseconds(0);
  date.setMinutes(date.getMinutes() - 30); // Subtract 30 minutes
  let meetingHour = date.toTimeString().split(" ")[0];
  meetingHour = meetingHour.substring(0, meetingHour.length - 3);
  return meetingHour;
}

module.exports = router;
