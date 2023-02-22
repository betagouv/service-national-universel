const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const Joi = require("joi");
const { canSendPlanDeTransport, MIME_TYPES, PDT_COLUMNS_BUS, PDT_COLUMNS_CENTER, PDT_COLUMNS_PDR, PDT_CELL_FORMAT, PDT_IMPORT_ERRORS } = require("snu-lib");
const FileType = require("file-type");
const fs = require("fs");
const config = require("../../config");
const NodeClam = require("clamscan");
const XLSX = require("xlsx");
const fileUpload = require("express-fileupload");
const { parse: parseDate } = require("date-fns");
const mongoose = require("mongoose");
const CohesionCenterModel = require("../../models/cohesionCenter");
const PdrModel = require("../../models/PlanDeTransport/pointDeRassemblement");
const SchemaRepartitionModel = require("../../models/PlanDeTransport/schemaDeRepartition");
const ImportPlanTransportModel = require("../../models/PlanDeTransport/importPlanTransport");
const LigneBusModel = require("../../models/PlanDeTransport/ligneBus");
const SessionPhase1Model = require("../../models/sessionPhase1");
const LigneToPointModel = require("../../models/PlanDeTransport/ligneToPoint");

const PDR_MEETING_HOUR_OFFSET = 60; // en minutes

/** ---------------------------------------------------------------------
 * ROUTE /plan-de-transport/import/:cohortName
 *
 * Vérifie un plan de transport importé et l'enregistre dans la collection importplandetransport.
 */
router.post(
  "/:cohortName",
  passport.authenticate("referent", { session: false, failWithError: true }),
  fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req, res) => {
    try {
      // --- validate entries
      const { error, value } = Joi.object({
        cohortName: Joi.string().required(),
      }).validate(req.params, { stripUnknown: true });
      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }
      const { cohortName } = value;

      const files = Object.values(req.files);
      if (files.length === 0) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
      const file = files[0];

      // --- rights
      if (!canSendPlanDeTransport(req.user)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      // --- verify file
      const { name, tempFilePath, mimetype } = file;
      const filetype = await FileType.fromFile(tempFilePath);
      const mimeFromMagicNumbers = filetype ? filetype.mime : MIME_TYPES.EXCEL;
      const validTypes = [MIME_TYPES.EXCEL];
      if (!(validTypes.includes(mimetype) && validTypes.includes(mimeFromMagicNumbers))) {
        fs.unlinkSync(tempFilePath);
        return res.status(500).send({ ok: false, code: "UNSUPPORTED_TYPE" });
      }

      if (config.ENVIRONMENT === "staging" || config.ENVIRONMENT === "production") {
        try {
          const clamscan = await new NodeClam().init({
            removeInfected: true,
          });
          const { isInfected } = await clamscan.isInfected(tempFilePath);
          if (isInfected) {
            capture(`File ${name} of user(${req.user.id})is infected`);
            return res.status(403).send({ ok: false, code: ERRORS.FILE_INFECTED });
          }
        } catch {
          return res.status(500).send({ ok: false, code: ERRORS.FILE_SCAN_DOWN });
        }
      }

      // --- get data
      const workbook = XLSX.readFile(tempFilePath);
      const worksheet = workbook.Sheets["ALLER-RETOUR"];
      const lines = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      if (lines.length <= 1) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }

      // on compte le nombre de PDR max du fichier à partir de la ligne de header.
      const countPdr = Math.max(1, (Math.max(...Object.keys(lines[0]).map((k) => parseInt(k))) - PDT_COLUMNS_BUS.length - PDT_COLUMNS_CENTER.length) / PDT_COLUMNS_PDR.length);

      // on retire la première ligne car il y a 2 lignes de header dans le modèle.
      lines.splice(0, 1);

      let errors = {};

      // first pass : format
      let hasError = verifyFormats(lines, countPdr, errors);
      // second pass : coherence
      hasError = (await verifyCoherence(lines, countPdr, cohortName, errors)) || hasError;
      // third pass : volume
      hasError = (await verifyVolume(lines, countPdr, cohortName, errors)) || hasError;
      // console.log("ERRORS: ", errors);

      if (hasError) {
        res.status(200).send({ ok: false, code: ERRORS.INVALID_BODY, errors, countPdr });
      } else {
        // save import
        const importData = await saveImport(lines, countPdr, cohortName);
        res.status(200).send({ ok: true, data: { ...importData, countPdr, lines: undefined } });
      }
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

module.exports = router;

// ---------------------------------------------------------------------
// FORMATS

function verifyFormats(lines, countPdr, errors) {
  let hasError = false;

  for (let l = 0, n = lines.length; l < n; ++l) {
    const line = cleanLine(lines[l], countPdr);
    // console.log("LINE: ", line);
    if (!isLineEmpty(line)) {
      for (let i = 0, n = PDT_COLUMNS_BUS.length; i < n; ++i) {
        const error = verifyCellFormat(PDT_COLUMNS_BUS[i], line[(i + 1).toString()]);
        hasError = addError(errors, l + 3, i + 1, error) || hasError;
      }
      let col = PDT_COLUMNS_BUS.length;
      const pdrInLine = countPdrInLine(lines[l], countPdr);
      for (let j = 0; j < Math.max(1, pdrInLine); ++j) {
        for (let i = 0, n = PDT_COLUMNS_PDR.length; i < n; ++i) {
          const error = verifyCellFormat(PDT_COLUMNS_PDR[i], line[(i + col + 1).toString()]);
          hasError = addError(errors, l + 3, i + col + 1, error) || hasError;
        }
        col += PDT_COLUMNS_PDR.length;
      }
      col = PDT_COLUMNS_BUS.length + countPdr * PDT_COLUMNS_PDR.length;
      for (let i = 0, n = PDT_COLUMNS_CENTER.length; i < n; ++i) {
        const error = verifyCellFormat(PDT_COLUMNS_CENTER[i], line[(i + col + 1).toString()]);
        hasError = addError(errors, l + 3, i + col + 1, error) || hasError;
      }
    }
  }

  return hasError;
}

function countPdrInLine(line, countPdr) {
  let count = 0;

  let col = PDT_COLUMNS_BUS.length + 1;
  for (let i = 0; i < countPdr; ++i) {
    for (let c = col, n = c + PDT_COLUMNS_PDR.length; c < n; ++c) {
      const key = c.toString();
      if (line[key] !== null && line[key] !== undefined && line[key] !== "") {
        count = i + 1;
        break;
      }
    }
    col += PDT_COLUMNS_PDR.length;
  }

  return count;
}

function cleanLine(line, countPdr) {
  for (let i = 0, n = PDT_COLUMNS_BUS.length; i < n; ++i) {
    line[(i + 1).toString()] = formatCell(PDT_COLUMNS_BUS[i], line[(i + 1).toString()]);
  }
  let col = PDT_COLUMNS_BUS.length;
  for (let j = 0; j < countPdr; ++j) {
    for (let i = 0, n = PDT_COLUMNS_PDR.length; i < n; ++i) {
      line[(i + col + 1).toString()] = formatCell(PDT_COLUMNS_PDR[i], line[(i + col + 1).toString()]);
    }
    col += PDT_COLUMNS_PDR.length;
  }
  for (let i = 0, n = PDT_COLUMNS_CENTER.length; i < n; ++i) {
    line[(i + col + 1).toString()] = formatCell(PDT_COLUMNS_CENTER[i], line[(i + col + 1).toString()]);
  }

  return line;
}

function formatCell(col, value) {
  if (value === null || value === undefined) {
    return value;
  }

  switch (col.format) {
    case PDT_CELL_FORMAT.string:
    case PDT_CELL_FORMAT.department:
    case PDT_CELL_FORMAT.objectId:
    case PDT_CELL_FORMAT.hour:
      return value.toString().trim();
    case PDT_CELL_FORMAT.date: {
      try {
        return parseDate(value, "dd/MM/yyyy", new Date());
      } catch (err) {
        return value;
      }
    }
    case PDT_CELL_FORMAT.transportType:
      return value.toString().trim().toLowerCase();
    case PDT_CELL_FORMAT.integer:
      return /^\d+$/.test(value) ? parseInt(value) : value;
    case PDT_CELL_FORMAT.boolean:
      return ["oui", "non"].includes(value.toLowerCase()) ? (value.toLowerCase() === "oui" ? "true" : "false") : null;
    default:
      return value;
  }
}

function isLineEmpty(line) {
  for (let key of Object.keys(line)) {
    if (line[key] !== null && line[key] !== undefined && line[key] !== "") {
      return false;
    }
  }
  return true;
}

/**
 * retourne null si il n'y a pas d'erreur. Et une string expliquant l'erreur sinon.
 */
function verifyCellFormat(col, value) {
  // console.log("verify: ", col, value);
  if (value === null || value === undefined) {
    return PDT_IMPORT_ERRORS.MISSING_DATA;
  }

  switch (col.format) {
    case PDT_CELL_FORMAT.string:
      return typeof value !== "string" || value.length === 0 ? PDT_IMPORT_ERRORS.BAD_FORMAT : null;
    case PDT_CELL_FORMAT.date: {
      try {
        parseDate(value, "dd/MM/yyyy", new Date());
        return null;
      } catch (err) {
        console.log("err: ", err, parseDate);
        return PDT_IMPORT_ERRORS.BAD_FORMAT;
      }
    }
    case PDT_CELL_FORMAT.department: {
      const val = parseInt(value);
      return value === "2a" || value === "2A" || value === "2b" || value === "2B" || (val > 0 && val <= 95 && val !== 20) || (val >= 971 && val <= 976)
        ? null
        : PDT_IMPORT_ERRORS.UNKNOWN_DEPARTMENT;
    }
    case PDT_CELL_FORMAT.objectId: {
      try {
        mongoose.Types.ObjectId(value);
        return null;
      } catch (err) {
        return PDT_IMPORT_ERRORS.BAD_FORMAT;
      }
    }
    case PDT_CELL_FORMAT.transportType:
      return ["bus", "train", "avion"].includes(value.toLowerCase()) ? null : PDT_IMPORT_ERRORS.UNKNOWN_TRANSPORT_TYPE;
    case PDT_CELL_FORMAT.hour: {
      if (!/^\d\d:\d\d$/.test(value)) {
        return PDT_IMPORT_ERRORS.BAD_FORMAT;
      }
      const parts = value.split(":", 2);
      const hour = parseInt(parts[0]);
      const min = parseInt(parts[1]);
      if (hour < 0 || hour > 23) {
        return PDT_IMPORT_ERRORS.BAD_FORMAT;
      }
      if (min < 0 || min > 59) {
        return PDT_IMPORT_ERRORS.BAD_FORMAT;
      }
      return null;
    }
    case PDT_CELL_FORMAT.integer:
      return typeof value === "number" && value >= 0 ? null : PDT_IMPORT_ERRORS.BAD_FORMAT;
    case PDT_CELL_FORMAT.boolean:
      return ["true", "false"].includes(value.toLowerCase()) ? null : PDT_IMPORT_ERRORS.BAD_FORMAT;
    default:
      return PDT_IMPORT_ERRORS.UNKNOWN_COLUM_TYPE;
  }
}

// ---------------------------------------------------------------------
// COHERENCE

async function verifyCoherence(lines, countPdr, cohort, errors) {
  let hasError = false;

  // verify sum in CAPACITE_TOTALE
  hasError = verifyCoherenceTotalCapacity(lines, countPdr, errors) || hasError;

  // Verify no doublon in num ligne
  hasError = verifyCoherenceBusLine(lines, errors) || hasError;

  // Verify center id and pdr id exists
  hasError = (await verifyCoherenceIds(lines, countPdr, cohort, errors)) || hasError;

  // Verify not 2 same pdr id in one bus line
  hasError = verifyCoherencePdrDoublons(lines, countPdr, errors) || hasError;
  return hasError;
}

function verifyCoherenceTotalCapacity(lines, countPdr, errors) {
  let hasError = false;
  const centerBase = PDT_COLUMNS_BUS.length + countPdr * PDT_COLUMNS_PDR.length;
  const totalCapacityCol = centerBase + PDT_COLUMNS_CENTER.findIndex((c) => c.id === "CAPACITE_TOTALE") + 1;
  const companionCapacityCol = centerBase + PDT_COLUMNS_CENTER.findIndex((c) => c.id === "CAPACITE_ACCOMPAGNATEURS") + 1;
  const youngCapacityCol = centerBase + PDT_COLUMNS_CENTER.findIndex((c) => c.id === "CAPACITE_VOLONTAIRES") + 1;
  for (let l = 0, n = lines.length; l < n; ++l) {
    if (parseInt(lines[l][totalCapacityCol]) !== parseInt(lines[l][companionCapacityCol]) + parseInt(lines[l][youngCapacityCol])) {
      addError(errors, l + 3, totalCapacityCol, PDT_IMPORT_ERRORS.BAD_TOTAL_CAPACITY);
      hasError = true;
    }
  }
  return hasError;
}

function verifyCoherenceBusLine(lines, errors) {
  let buslines = {};
  for (let i = 0, n = lines.length; i < n; ++i) {
    const line = lines[i];
    const lineNum = line["1"];
    if (lineNum !== null && lineNum !== undefined && lineNum.length > 0) {
      if (buslines[lineNum] === undefined) {
        buslines[lineNum] = [];
      }
      buslines[lineNum].push(i + 3);
    }
  }

  let hasError = false;
  for (let lineNum of Object.keys(buslines)) {
    const lineNums = buslines[lineNum];
    const n = lineNums.length;
    if (n > 1) {
      addError(errors, lineNums, 1, PDT_IMPORT_ERRORS.DOUBLON_BUSNUM, lineNum);
    }
  }

  return hasError;
}

async function verifyCoherenceIds(lines, countPdr, cohort, errors) {
  // get all center & pdr ids
  const centerIdCol = PDT_COLUMNS_BUS.length + countPdr * PDT_COLUMNS_PDR.length + PDT_COLUMNS_CENTER.findIndex((c) => c.id === "CENTRE_ID") + 1;
  const basePdrCol = PDT_COLUMNS_BUS.length + 1;
  const pdrIdRelativeCol = PDT_COLUMNS_PDR.findIndex((c) => c.id === "PDR_ID");
  let pdrs = {};
  let centers = {};
  for (let i = 0, n = lines.length; i < n; ++i) {
    const line = lines[i];
    const centerId = line[centerIdCol];
    if (centerId !== null && centerId !== undefined && centerId.length > 0) {
      if (centers[centerId] === undefined) {
        try {
          centers[centerId] = { id: mongoose.Types.ObjectId(centerId), lines: [] };
        } catch (err) {
          // bad objectId
        }
      }
      if (centers[centerId] !== undefined) {
        centers[centerId].lines.push(i + 3);
      }
    }
    for (let j = 0; j < countPdr; ++j) {
      const col = basePdrCol + j * PDT_COLUMNS_PDR.length + pdrIdRelativeCol;
      const pdrId = line[col];
      if (pdrId !== null && pdrId !== undefined && pdrId.length > 0) {
        if (pdrs[pdrId] === undefined) {
          try {
            pdrs[pdrId] = { id: mongoose.Types.ObjectId(pdrId), cells: [] };
          } catch (err) {
            // bad objectId
          }
        }
        if (pdrs[pdrId] !== undefined) {
          pdrs[pdrId].cells.push({ line: i + 3, col });
        }
      }
    }
  }
  const centerIds = Object.values(centers).map((c) => c.id);
  const pdrIds = Object.values(pdrs).map((p) => p.id);

  // search for existing centers & pdrs
  const existingCenters = await CohesionCenterModel.find({ _id: { $in: centerIds } }, { _id: 1 });
  const existingPdrs = await PdrModel.find({ _id: { $in: pdrIds } }, { _id: 1 });

  let hasError = false;
  // error for centers
  if (existingCenters.length < centerIds.length) {
    let existingCentersSet = {};
    for (const ec of existingCenters) {
      existingCentersSet[ec._id.toString()] = true;
    }
    for (const centerId of Object.keys(centers)) {
      if (existingCentersSet[centerId] === undefined) {
        for (const lineNum of centers[centerId].lines) {
          addError(errors, lineNum, centerIdCol, PDT_IMPORT_ERRORS.BAD_CENTER_ID, centerId);
          hasError = true;
        }
      }
    }
  }

  // error for pdrs
  if (existingPdrs.length < pdrIds.length) {
    let existingPdrsSet = {};
    for (const ep of existingPdrs) {
      existingPdrsSet[ep._id.toString()] = true;
    }
    for (const pdrId of Object.keys(pdrs)) {
      if (existingPdrsSet[pdrId] === undefined) {
        for (const cell of pdrs[pdrId].cells) {
          addError(errors, cell.line, cell.col, PDT_IMPORT_ERRORS.BAD_PDR_ID, pdrId);
          hasError = true;
        }
      }
    }
  }

  // --- search for sessions
  const sessions = await SessionPhase1Model.find({ cohort: cohort, cohesionCenterId: { $in: centerIds } }, { _id: 1, cohesionCenterId: 1 });
  const sessionSet = {};
  for (const session of sessions) {
    sessionSet[session.cohesionCenterId] = session._id.toString();
  }
  for (let i = 0, n = lines.length; i < n; ++i) {
    const centerId = lines[i][centerIdCol];
    if (!sessionSet[centerId]) {
      addError(errors, i + 3, centerIdCol, PDT_IMPORT_ERRORS.CENTER_WITHOUT_SESSION, centerId);
      hasError = true;
    }
  }

  return hasError;
}

function verifyCoherencePdrDoublons(lines, countPdr, errors) {
  const basePdrCol = PDT_COLUMNS_BUS.length + 1;
  const pdrIdRelativeCol = PDT_COLUMNS_PDR.findIndex((c) => c.id === "PDR_ID");
  let hasError = false;
  for (let i = 0, n = lines.length; i < n; ++i) {
    let pdrIds = {};
    for (let j = 0; j < countPdr; ++j) {
      const col = basePdrCol + PDT_COLUMNS_PDR.length * j + pdrIdRelativeCol;
      const pdrId = lines[i][col];
      if (pdrId !== null && pdrId !== undefined && pdrId.length > 0) {
        if (pdrIds[pdrId] === undefined) {
          pdrIds[pdrId] = col;
        } else {
          addError(errors, i + 3, col, PDT_IMPORT_ERRORS.SAME_PDR_ON_LINE, pdrId);
          addError(errors, i + 3, pdrIds[pdrId], PDT_IMPORT_ERRORS.SAME_PDR_ON_LINE, pdrId);
          hasError = true;
          break;
        }
      }
    }
  }

  return hasError;
}

// ---------------------------------------------------------------------
// VOLUMES

async function verifyVolume(lines, countPdr, cohort, errors) {
  let centers = {};

  // volume & lines for each centers from plan de transport
  const centerIdCol = PDT_COLUMNS_BUS.length + countPdr * PDT_COLUMNS_PDR.length + PDT_COLUMNS_CENTER.findIndex((c) => c.id === "CENTRE_ID") + 1;
  const youngCapacityCol = PDT_COLUMNS_BUS.length + countPdr * PDT_COLUMNS_PDR.length + PDT_COLUMNS_CENTER.findIndex((c) => c.id === "CAPACITE_VOLONTAIRES") + 1;
  for (let i = 0, n = lines.length; i < n; ++i) {
    const centerId = lines[i][centerIdCol];
    const capacity = lines[i][youngCapacityCol];

    if (centerId !== null && centerId !== undefined && centerId.length > 0 && capacity !== null && capacity !== undefined && capacity.length > 0) {
      if (centers[centerId] === undefined) {
        centers[centerId] = { planVolume: 0, schemaVolume: 0, lines: [] };
      }
      centers[centerId].lines.push(i + 3);
      const volume = parseInt(capacity);
      if (!isNaN(volume) && volume > 0) {
        centers[centerId].planVolume += volume;
      }
    }
  }

  // volume for each centers from schema
  const centerIds = Object.keys(centers);
  const groups = await SchemaRepartitionModel.find({ cohort, centerId: { $in: centerIds } }, { centerId: 1, youngsVolume: 1 });
  for (const group of groups) {
    centers[group.centerId].schemaVolume += group.youngsVolume;
  }

  // verify for each groups
  let hasError = false;
  for (const centerId of Object.keys(centers)) {
    const centerData = centers[centerId];

    if (centerData.planVolume < centerData.schemaVolume) {
      addError(errors, centerData.lines, youngCapacityCol, PDT_IMPORT_ERRORS.LACKING_YOUNG_CAPACITY, centerId);
      hasError = true;
    }
  }

  return hasError;
}

function addError(errors, line, col, error, extra) {
  if (error) {
    // console.log("Add Error: ", line, col, error);
    if (errors[col] === undefined) {
      errors[col] = {};
    }
    const lineKey = Array.isArray(line) ? (line.length > 1 ? "Lignes " : "Ligne ") + line.join(", ") : "Ligne " + line;
    errors[col][lineKey] = { error, extra };
    return true;
  } else {
    return false;
  }
}

async function saveImport(lines, countPdr, cohort) {
  // counts
  const newImport = {
    cohort,
    ...getCounts(lines, countPdr),
    lines,
  };

  const result = await ImportPlanTransportModel.create(newImport);
  return result.toObject();
}

function getCounts(lines, countPdr) {
  const centerIdCol = PDT_COLUMNS_BUS.length + countPdr * PDT_COLUMNS_PDR.length + PDT_COLUMNS_CENTER.findIndex((c) => c.id === "CENTRE_ID") + 1;
  const basePdrCol = PDT_COLUMNS_BUS.length + 1;
  const pdrIdRelativeCol = PDT_COLUMNS_PDR.findIndex((c) => c.id === "PDR_ID");
  let pdrs = {};
  let centers = {};
  for (let i = 0, n = lines.length; i < n; ++i) {
    const line = lines[i];
    const centerId = line[centerIdCol];
    if (centerId !== null && centerId !== undefined && centerId.length > 0) {
      if (centers[centerId] === undefined) {
        try {
          centers[centerId] = true;
        } catch (err) {
          // bad objectId
        }
      }
    }
    for (let j = 0; j < countPdr; ++j) {
      const col = basePdrCol + j * PDT_COLUMNS_PDR.length + pdrIdRelativeCol;
      const pdrId = line[col];
      if (pdrId !== null && pdrId !== undefined && pdrId.length > 0) {
        if (pdrs[pdrId] === undefined) {
          try {
            pdrs[pdrId] = true;
          } catch (err) {
            // bad objectId
          }
        }
      }
    }
  }

  return {
    busLineCount: lines.length,
    pdrCount: Object.keys(pdrs).length,
    centerCount: Object.keys(centers).length,
    maxPdrPerLine: countPdr,
  };
}

/** ---------------------------------------------------------------------
 * ROUTE /plan-de-transport/import/:importId/execute
 *
 * Importe un plan de transport vérifié et enregistré dans importplandetransport.
 */
router.post("/:importId/execute", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  try {
    // --- validate entries
    const { error, value } = Joi.object({
      importId: Joi.string().required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { importId } = value;

    // --- get object
    const importData = await ImportPlanTransportModel.findById(importId);
    if (!importData) {
      return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
    }

    // --- verify rights
    if (!canSendPlanDeTransport(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    // --- execute importation
    const data = await executeImportation(importData);

    // --- return
    res.status(200).send({ ok: true, data });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  }
});

async function executeImportation(importData) {
  let importedCount = 0;

  if (importData.lines && importData.lines.length > 0) {
    const centerCol = PDT_COLUMNS_BUS.length + importData.maxPdrPerLine * PDT_COLUMNS_PDR.length + 1;

    // --- find session ids of center in bus lines.
    let centerIdsSet = {};
    for (const line of importData.lines) {
      const centerId = line[(centerCol + 1).toString()];
      centerIdsSet[centerId] = true;
    }
    const centerIds = Object.keys(centerIdsSet);
    const sessions = await SessionPhase1Model.find({ cohort: importData.cohort, cohesionCenterId: { $in: centerIds } }, { _id: 1, cohesionCenterId: 1 });
    const sessionSet = {};
    for (const session of sessions) {
      sessionSet[session.cohesionCenterId] = session._id.toString();
    }

    // --- create bus lines.
    for (const line of importData.lines) {
      // compute pdr ids and center id.
      let pdrIds = [];
      let col = PDT_COLUMNS_BUS.length + 1;
      for (let i = 0; i < importData.maxPdrPerLine; ++i) {
        const pdrId = line[(col + 1).toString()];
        if (pdrId !== null && pdrId !== undefined && pdrId !== "") {
          pdrIds.push(pdrId);
        }
        col += PDT_COLUMNS_PDR.length;
      }
      const centerId = line[(centerCol + 1).toString()];
      const sessionId = sessionSet[centerId];
      if (sessionId) {
        let newBusLineData = {
          cohort: importData.cohort,
          busId: line["1"],
          departuredDate: line["2"],
          returnDate: line["3"],
          centerId,
          centerArrivalTime: line[(centerCol + 3).toString()],
          centerDepartureTime: line[(centerCol + 4).toString()],
          followerCapacity: line[(centerCol + 5).toString()],
          youngCapacity: line[(centerCol + 6).toString()],
          totalCapacity: line[(centerCol + 7).toString()],
          youngSeatsTaken: 0,
          lunchBreak: line[(centerCol + 8).toString()] === "true",
          lunchBreakReturn: line[(centerCol + 9).toString()] === "true",
          travelTime: line[(centerCol + 10).toString()],
          sessionId,
          meetingPointsIds: pdrIds,
        };
        const newBusLine = new LigneBusModel(newBusLineData);
        const busLine = await newBusLine.save();

        let col = PDT_COLUMNS_BUS.length + 1;
        for (let i = 0, n = countPdrInLine(line, importData.maxPdrPerLine); i < n; ++i) {
          const newLineToPointData = {
            lineId: busLine._id.toString(),
            meetingPointId: line[(col + 1).toString()],
            transportType: line[(col + 2).toString()],
            busArrivalHour: line[(col + 4).toString()],
            departureHour: line[(col + 5).toString()],
            meetingHour: getPDRMeetingHour(line[(col + 5).toString()]),
            returnHour: line[(col + 6).toString()],
            stepPoints: [
              {
                address: line[(col + 3).toString()],
                departureHour: line[(col + 5).toString()],
                returnHour: line[(col + 6).toString()],
                transportType: line[(col + 2).toString()],
              },
            ],
          };
          const newLineToPoint = new LigneToPointModel(newLineToPointData);
          await newLineToPoint.save();
        }

        ++importedCount;
      }
    }
  }

  return importedCount;
}

function getPDRMeetingHour(departureHour) {
  const parts = departureHour.split(":", 2);
  const hh = parseInt(parts[0]);
  const mm = parseInt(parts[1]);
  const minutes = hh * 60 + mm;
  const meetingMinutes = minutes - PDR_MEETING_HOUR_OFFSET;
  const new_hh = Math.floor(meetingMinutes / 60);
  const new_mm = meetingMinutes % 60;

  return (new_hh < 10 ? "0" : "") + new_hh + ":" + new_mm;
}
