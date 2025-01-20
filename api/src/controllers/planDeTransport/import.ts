import express, { Response } from "express";
import passport from "passport";
import { capture } from "../../sentry";
import { ERRORS } from "../../utils";
import Joi from "joi";
import {
  canSendPlanDeTransport,
  MIME_TYPES,
  COHORT_TYPE,
  TRANSPORT_MODES,
  TRANSPORT_CONVOCATION_SUBTRACT_MINUTES_DEFAULT,
  TRANSPORT_CONVOCATION_SUBTRACT_MINUTES,
  FUNCTIONAL_ERRORS,
} from "snu-lib";
import fs from "fs";
import { parse as parseDate } from "date-fns";
import fileUpload from "express-fileupload";
import {
  CohesionCenterModel,
  PointDeRassemblementModel,
  ImportPlanTransportModel,
  LigneBusModel,
  SessionPhase1Model,
  LigneToPointModel,
  PlanTransportModel,
  ClasseModel,
  CohortModel,
  type PlanTransportModesType,
} from "../../models";

const scanFile = require("../../utils/virusScanner");
import { getMimeFromFile } from "../../utils/file";
import { validateId } from "../../utils/validator";
import { validatePdtFile, computeImportSummary } from "../../planDeTransport/planDeTransport/import/pdtImportService";
import { formatTime } from "../../planDeTransport/planDeTransport/import/pdtImportUtils";
import { startSession, withTransaction, endSession } from "../../mongo";
import { UserRequest } from "../request";

interface ImportPlanTransportLine {
  [key: string]: string | string[] | undefined;
  "NUMERO DE LIGNE": string;
  "DATE DE TRANSPORT ALLER": string;
  "DATE DE TRANSPORT RETOUR": string;
  "ID CENTRE": string;
  "HEURE D'ARRIVEE AU CENTRE": string;
  "HEURE DE DÉPART DU CENTRE": string;
  "TOTAL ACCOMPAGNATEURS": string;
  "CAPACITÉ VOLONTAIRE TOTALE": string;
  "CAPACITE TOTALE LIGNE": string;
  "PAUSE DÉJEUNER ALLER"?: string;
  "PAUSE DÉJEUNER RETOUR"?: string;
  "TEMPS DE ROUTE": string;
  "ID CLASSE"?: string;
  "LIGNES FUSIONNÉES"?: string;
}

interface StepPoint {
  type: string;
  address: string;
  departureHour: string;
  returnHour: string;
  transportType: string;
}

interface LineToPoint {
  lineId: string;
  meetingPointId: string;
  transportType: string;
  busArrivalHour: string;
  departureHour: string;
  meetingHour: string;
  returnHour: string;
  stepPoints: StepPoint[];
}

const router = express.Router();

// Vérifie un plan de transport importé et l'enregistre dans la collection importplandetransport.
router.post(
  "/:cohortName",
  passport.authenticate("referent", { session: false, failWithError: true }),
  fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, useTempFiles: true, tempFileDir: "/tmp/" }),
  async (req: UserRequest, res: Response) => {
    try {
      const { error, value } = Joi.object({
        cohortName: Joi.string().required(),
      }).validate(req.params, { stripUnknown: true });

      if (error) {
        capture(error);
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const files = Object.values(req.files || {});
      if (files.length === 0) {
        return res.status(400).send({ ok: false, code: ERRORS.INVALID_BODY });
      }
      const file = files[0];

      if (!canSendPlanDeTransport(req.user)) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      const { name, tempFilePath, mimetype } = file as any;
      const filetype = await getMimeFromFile(tempFilePath);
      const mimeFromMagicNumbers = filetype || MIME_TYPES.EXCEL;
      const validTypes: string[] = [MIME_TYPES.EXCEL];

      if (!validTypes.includes(mimetype) && !validTypes.includes(mimeFromMagicNumbers)) {
        fs.unlinkSync(tempFilePath);
        return res.status(400).send({ ok: false, code: ERRORS.UNSUPPORTED_TYPE });
      }

      const scanResult = await scanFile(tempFilePath, name, req.user._id);
      if (scanResult.infected) {
        return res.status(400).send({ ok: false, code: ERRORS.FILE_INFECTED });
      }

      const cohort = await CohortModel.findOne({ name: value.cohortName });
      if (!cohort) {
        return res.status(404).send({ ok: false, code: ERRORS.INVALID_PARAMS });
      }

      const isCle = cohort.type === COHORT_TYPE.CLE;
      const { lines = [], errors, ok, code } = await validatePdtFile(tempFilePath, cohort.name, isCle);
      if (!ok) {
        return res.status(400).send({ ok: false, code: code || ERRORS.INVALID_BODY, errors });
      }

      const { centerCount, classeCount, pdrCount, maxPdrOnLine } = computeImportSummary(lines);

      const { _id } = await ImportPlanTransportModel.create({ cohort: cohort.name, cohortId: cohort._id, lines });

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
router.post("/:importId/execute", passport.authenticate("referent", { session: false, failWithError: true }), async (req: UserRequest, res: Response) => {
  const transaction = await startSession();
  try {
    const { error, value: importId } = validateId(req.params.importId);
    if (error) {
      capture(error);
      return res.status(400).send({ ok: false, code: ERRORS.INVALID_PARAMS });
    }
    if (!canSendPlanDeTransport(req.user)) {
      return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
    }

    await withTransaction(transaction, async () => {
      const importData = await ImportPlanTransportModel.findById(importId);
      if (!importData) {
        return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      }

      const lines = importData.lines as ImportPlanTransportLine[];
      const countPdr = Object.keys(lines[0]).filter((e) => e.startsWith("MATRICULE PDR")).length;

      // Vérification des lignes existantes
      const newLines: ImportPlanTransportLine[] = [];
      const promises = lines.map((line) =>
        LigneBusModel.findOne({
          cohort: importData.cohort,
          busId: line["NUMERO DE LIGNE"],
        }),
      );

      const oldLines = await Promise.all(promises);
      lines.forEach((line, i) => {
        if (!oldLines[i]) {
          newLines.push(line);
        }
      });

      // Import des nouvelles lignes
      for (const line of newLines) {
        const pdrMatriculeIdMap = new Map();
        for (let pdrNumber = 1; pdrNumber <= countPdr; pdrNumber++) {
          const pdrKey = `MATRICULE PDR ${pdrNumber}` as keyof ImportPlanTransportLine;
          const pdrValue = line[pdrKey]?.toString();
          if (line[pdrKey] && !["correspondance aller", "correspondance retour", "correspondance"].includes(pdrValue || "")) {
            const pdr = await PointDeRassemblementModel.findOne({ matricule: pdrValue });
            if (!pdr) {
              throw new Error(ERRORS.NOT_FOUND, { cause: `Pdr not found for matricule : ${pdrValue}` });
            }
            pdrMatriculeIdMap.set(line[pdrKey] as string, pdr._id);
          }
        }
        const meetingPointsIds = Array.from(pdrMatriculeIdMap.values());

        const cohesionCenter = await CohesionCenterModel.find({ matricule: line["MATRICULE CENTRE"] });
        if (cohesionCenter.length > 1) {
          throw new Error(FUNCTIONAL_ERRORS.MORE_THAN_ONE_CENTER_FOR_ONE_MATRICULE, { cause: `More than one cohesionCenter for matricule : ${line["MATRICULE CENTRE"]}` });
        }
        if (cohesionCenter.length === 0) {
          throw new Error(ERRORS.NOT_FOUND, { cause: `No cohesionCenter for matricule : ${line["MATRICULE CENTRE"]}` });
        }
        const session = await SessionPhase1Model.findOne({ cohort: importData.cohort, cohesionCenterId: cohesionCenter[0]._id });
        const busLineData = {
          cohort: importData.cohort,
          cohortId: importData.cohortId,
          busId: line["NUMERO DE LIGNE"],
          departuredDate: parseDate(line["DATE DE TRANSPORT ALLER"], "dd/MM/yyyy", new Date()),
          returnDate: parseDate(line["DATE DE TRANSPORT RETOUR"], "dd/MM/yyyy", new Date()),
          centerId: cohesionCenter[0]._id,
          centerArrivalTime: formatTime(line["HEURE D'ARRIVEE AU CENTRE"]),
          centerDepartureTime: formatTime(line["HEURE DE DÉPART DU CENTRE"]),
          followerCapacity: line["TOTAL ACCOMPAGNATEURS"],
          youngCapacity: line["CAPACITÉ VOLONTAIRE TOTALE"],
          totalCapacity: line["CAPACITE TOTALE LIGNE"],
          youngSeatsTaken: 0,
          lunchBreak: (line["PAUSE DÉJEUNER ALLER"] || "").toLowerCase() === "oui",
          travelTime: formatTime(line["TEMPS DE ROUTE"]),
          sessionId: session?._id.toString(),
          meetingPointsIds: meetingPointsIds,
          classeId: line["ID CLASSE"] ? line["ID CLASSE"].toLowerCase() : undefined,
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

        const lineToPointWithCorrespondance: LineToPoint[] = Array.from({ length: countPdr }, (_, i) => i + 1).reduce((acc: LineToPoint[], pdrNumber) => {
          const pdrKey = `MATRICULE PDR ${pdrNumber}` as keyof ImportPlanTransportLine;
          const pdrValue = line[pdrKey]?.toString();

          if (pdrNumber > 1 && !line[pdrKey]) return acc;

          if (!["correspondance aller", "correspondance retour", "correspondance"].includes(pdrValue || "")) {
            acc.push({
              lineId: busLine._id.toString(),
              meetingPointId: pdrMatriculeIdMap.get(line[pdrKey] as string),
              transportType: line[`TYPE DE TRANSPORT PDR ${pdrNumber}`]?.toString().toLowerCase() || "",
              busArrivalHour: formatTime(line[`HEURE ALLER ARRIVÉE AU PDR ${pdrNumber}`] as string),
              departureHour: formatTime(line[`HEURE DEPART DU PDR ${pdrNumber}`] as string),
              meetingHour: getPDRMeetingHour(
                formatTime(line[`HEURE DEPART DU PDR ${pdrNumber}`] as string),
                line[`TYPE DE TRANSPORT PDR ${pdrNumber}`]?.toString().toLowerCase() as PlanTransportModesType,
              ),
              returnHour: formatTime(line[`HEURE DE RETOUR ARRIVÉE AU PDR ${pdrNumber}`] as string),
              stepPoints: [],
            });
          } else {
            if (pdrValue === "correspondance") {
              // Special case: when correspondance is not aller or retour
              // We create 2 step points (aller and retour).
              acc[acc.length - 1].stepPoints.push({
                type: "aller",
                address: line[`NOM + ADRESSE DU PDR ${pdrNumber}`] as string,
                departureHour: formatTime(line[`HEURE DEPART DU PDR ${pdrNumber}`] as string),
                returnHour: "",
                transportType: line[`TYPE DE TRANSPORT PDR ${pdrNumber}`]?.toString().toLowerCase() || "",
              });
              acc[acc.length - 1].stepPoints.push({
                type: "retour",
                address: line[`NOM + ADRESSE DU PDR ${pdrNumber}`] as string,
                departureHour: "",
                returnHour: formatTime(line[`HEURE DE RETOUR ARRIVÉE AU PDR ${pdrNumber}`] as string),
                transportType: line[`TYPE DE TRANSPORT PDR ${pdrNumber}`]?.toString().toLowerCase() || "",
              });
            } else {
              const isAller = pdrValue === "correspondance aller";
              acc[acc.length - 1].stepPoints.push({
                type: isAller ? "aller" : "retour",
                address: line[`NOM + ADRESSE DU PDR ${pdrNumber}`] as string,
                departureHour: isAller ? formatTime(line[`HEURE DEPART DU PDR ${pdrNumber}`] as string) : "",
                returnHour: isAller ? "" : formatTime(line[`HEURE DE RETOUR ARRIVÉE AU PDR ${pdrNumber}`] as string),
                transportType: line[`TYPE DE TRANSPORT PDR ${pdrNumber}`]?.toString().toLowerCase() || "",
              });
            }
          }
          return acc;
        }, []);

        for (const lineToPoint of lineToPointWithCorrespondance) {
          const newLineToPoint = new LigneToPointModel(lineToPoint);
          await newLineToPoint.save({ session: transaction });
        }

        // Update slave PlanTransport
        const center = await CohesionCenterModel.findById(busLine.centerId);
        const pointDeRassemblements: unknown[] = [];

        for (const ltp of lineToPointWithCorrespondance) {
          const pdr = await PointDeRassemblementModel.findById(ltp.meetingPointId);
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
          if (!classe) {
            return res.status(404).send({
              ok: false,
              code: `La classe (ID: ${busLine.classeId}) n'existe pas. Vérifiez les données.`,
            });
          }
          classe.set({ ligneId: busLine._id });
          await classe.save({ session: transaction });
        }

        await PlanTransportModel.create(
          [
            {
              _id: busLine._id,
              cohort: busLine.cohort,
              busId: busLine.busId,
              departureString: busLine.departuredDate.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
              returnString: busLine.returnDate.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }),
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
              centerCode: center?.matricule,
              centerArrivalTime: busLine.centerArrivalTime,
              centerDepartureTime: busLine.centerDepartureTime,
              pointDeRassemblements,
              classeId: busLine.classeId,
            },
          ],
          { session: transaction },
        );
      }

      res.status(200).send({ ok: true, data: lines.length });
    });
  } catch (error) {
    capture(error);
    res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
  } finally {
    await endSession(transaction);
  }
});

function getPDRMeetingHour(departureHour: string, transportType: PlanTransportModesType = TRANSPORT_MODES.BUS): string {
  const [hour, minute] = departureHour.split(":");

  const date = new Date();
  date.setHours(parseInt(hour));
  date.setMinutes(parseInt(minute));
  date.setSeconds(0);
  date.setMilliseconds(0);
  date.setMinutes(date.getMinutes() - (TRANSPORT_CONVOCATION_SUBTRACT_MINUTES[transportType] ?? TRANSPORT_CONVOCATION_SUBTRACT_MINUTES_DEFAULT));
  let meetingHour = date.toTimeString().split(" ")[0];
  meetingHour = meetingHour.substring(0, meetingHour.length - 3);
  return meetingHour;
}

export default router;
