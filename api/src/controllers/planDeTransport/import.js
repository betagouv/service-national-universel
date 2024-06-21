const express = require("express");
const router = express.Router();
const passport = require("passport");
const { capture } = require("../../sentry");
const { ERRORS } = require("../../utils");
const Joi = require("joi");
const { canSendPlanDeTransport, MIME_TYPES, COHORT_TYPE } = require("snu-lib");
const fs = require("fs");
const { parse: parseDate } = require("date-fns");
const fileUpload = require("express-fileupload");
const CohesionCenterModel = require("../../models/cohesionCenter");
const PdrModel = require("../../models/PlanDeTransport/pointDeRassemblement");
const ImportPlanTransportModel = require("../../models/PlanDeTransport/importPlanTransport");
const LigneBusModel = require("../../models/PlanDeTransport/ligneBus");
const SessionPhase1Model = require("../../models/sessionPhase1");
const LigneToPointModel = require("../../models/PlanDeTransport/ligneToPoint");
const PlanTransportModel = require("../../models/PlanDeTransport/planTransport");
const ClasseModel = require("../../models/cle/classe");
const CohorteModel = require("../../models/cohort");
const scanFile = require("../../utils/virusScanner");
const { getMimeFromFile } = require("../../utils/file");

const { validatePdtFile, computeImportSummary } = require("../../pdt/import/pdtImportService");
const { formatTime } = require("../../pdt/import/pdtImportUtils");
const { startSession } = require("../../mongo");

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
      const cohort = await CohorteModel.findOne({ name: value.cohortName });
      if (!cohort) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const files = Object.values(req.files);
      if (files.length === 0) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
      const file = files[0];

      if (!canSendPlanDeTransport(req.user)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      const { name, tempFilePath, mimetype } = file;
      const filetype = await getMimeFromFile(tempFilePath);
      const mimeFromMagicNumbers = filetype || MIME_TYPES.EXCEL;
      const validTypes = [MIME_TYPES.EXCEL];
      if (!(validTypes.includes(mimetype) && validTypes.includes(mimeFromMagicNumbers))) {
        fs.unlinkSync(tempFilePath);
        return res.status(400).send({ ok: false, code: ERRORS.UNSUPPORTED_TYPE });
      }

      const scanResult = await scanFile(tempFilePath, name, req.user.id);
      if (scanResult.infected) {
        return res.status(400).send({ ok: false, code: ERRORS.FILE_INFECTED });
      }

      const isCle = cohort.type === COHORT_TYPE.CLE;
      const { lines, errors, ok, code } = await validatePdtFile(tempFilePath, cohort.name, isCle);
      if (!ok) {
        return res.status(400).send({ ok: false, code: code || ERRORS.INVALID_BODY, errors });
      }

      const { centerCount, classeCount, pdrCount, maxPdrOnLine } = computeImportSummary(lines);

      // Save import plan
      const { _id } = await ImportPlanTransportModel.create({ cohort: cohort.name, lines });

      // Send response (summary)
      res.status(200).send({
        ok: true,
        data: { _id, busLineCount: lines.length, centerCount, classeCount, pdrCount, maxPdrOnLine, cohort },
      });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);

// Importe un plan de transport vérifié et enregistré dans importplandetransport.
router.post("/:importId/execute", passport.authenticate("referent", { session: false, failWithError: true }), async (req, res) => {
  const transaction = await startSession();
  try {
    const { error, value } = Joi.object({
      importId: Joi.string().required(),
    }).validate(req.params, { stripUnknown: true });
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    const { importId } = value;
    await transaction.withTransaction(async () => {
      const importData = await ImportPlanTransportModel.findById(importId);
      if (!importData) {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }

      if (!canSendPlanDeTransport(req.user)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      const lines = importData.lines;
      const countPdr = Object.keys(lines[0]).filter((e) => e.startsWith("ID PDR")).length;

      // Vérification des lignes existantes (ne sont modifié que les nouvelles)
      const newLines = [];
      const promises = [];
      for (const line of importData.lines) {
        promises.push(LigneBusModel.findOne({ cohort: importData.cohort, busId: line["NUMERO DE LIGNE"] }));
      }
      const oldLines = await Promise.all(promises);
      for (let i = 0; i < oldLines.length; i++) {
        if (!oldLines[i]) {
          newLines.push(importData.lines[i]);
        }
      }

      // import des nouvelles lignes
      for (const line of newLines) {
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
          classeId: line["ID CLASSE"] ? line["ID CLASSE"] : undefined,
          mergedBusIds: line["LIGNES FUSIONNÉES"] ? line["LIGNES FUSIONNÉES"].split(",") : [],
        };
        const newBusLine = new LigneBusModel(busLineData);
        const busLine = await newBusLine.save({ session: transaction });

        // Mise à jour des lignes fusionnées existantes
        for (const mergedBusId of busLineData.mergedBusIds) {
          const oldMergeLine = await LigneBusModel.findOne({ busId: mergedBusId });
          if (oldMergeLine) {
            oldMergeLine.set({ mergedBusIds: busLineData.mergedBusIds });
            await oldMergeLine.save({ session: transaction });
          }
        }

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
          await newLineToPoint.save({ session: transaction });
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
        if (busLine.classeId) {
          const classe = await ClasseModel.findById(busLine.classeId);
          if (!classe) return res.status(404).send({ ok: false, code: `La classe (ID: ${busLine.classeId}) n'existe pas. Vérifiez les données.` });
          classe.set({ ligneId: busLine._id });
          await classe.save({ session: transaction });
        }

        await PlanTransportModel.create(
          [
            {
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
              classeId: busLine.classeId ? busLine.classeId : undefined,
            },
          ],
          { session: transaction },
        );
        // * End update slave PlanTransport
      }

      res.status(200).send({ ok: true, data: lines.length });
    });
  } catch (error) {
    capture(error);

    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  } finally {
    await transaction.endSession();
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
