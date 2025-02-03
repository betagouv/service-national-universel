import express, { Response } from "express";
import passport from "passport";
import { capture } from "../../sentry";
import { ERRORS } from "../../utils";
import Joi from "joi";
import { canSendPlanDeTransport, MIME_TYPES, COHORT_TYPE, TRANSPORT_MODES, TRANSPORT_CONVOCATION_SUBTRACT_MINUTES_DEFAULT, TRANSPORT_CONVOCATION_SUBTRACT_MINUTES } from "snu-lib";
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

import scanFile from "../../utils/virusScanner";
import { getMimeFromFile } from "../../utils/file";
import { validateId } from "../../utils/validator";
import { validatePdtFile, computeImportSummary } from "../../planDeTransport/planDeTransport/import/pdtImportService";
import {
  computeMergedBusIds,
  formatTime,
  getLinePdrCount,
  getMergedBusIdsFromLigneBus,
  ImportPlanTransportLine,
  mapTransportType,
} from "../../planDeTransport/planDeTransport/import/pdtImportUtils";
import { startSession, withTransaction, endSession } from "../../mongo";
import { UserRequest } from "../request";
import { syncMergedBus } from "../../planDeTransport/ligneDeBus/ligneDeBusService";

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
      const countPdr = lines.reduce((acc, line) => {
        const count = getLinePdrCount(line);
        return count > acc ? count : acc;
      }, 0);
      const linesIds = lines.map((line) => line["NUMERO DE LIGNE"]);

      // Vérification des lignes existantes
      const oldLines = await LigneBusModel.find({
        cohort: importData.cohort,
        busId: { $in: linesIds },
      });
      const newLines: ImportPlanTransportLine[] = lines.filter((line) => !oldLines.find((oldLine) => oldLine.busId === line["NUMERO DE LIGNE"]));

      const existingMergedBusIds = getMergedBusIdsFromLigneBus(oldLines);
      // calcul de la listes des lignes fusionnées associées à la colonne LIGNES FUSIONNÉES
      const newMergedBusIds = computeMergedBusIds(newLines, existingMergedBusIds);

      // Import des nouvelles lignes
      for (const line of newLines) {
        const pdrIds: string[] = [];
        for (let pdrNumber = 1; pdrNumber <= countPdr; pdrNumber++) {
          const pdrKey = `ID PDR ${pdrNumber}` as keyof ImportPlanTransportLine;
          const pdrValue = line[pdrKey]?.toString().toLowerCase();
          if (pdrValue && !["correspondance aller", "correspondance retour", "correspondance"].includes(pdrValue || "")) {
            pdrIds.push(pdrValue);
          }
        }

        const session = await SessionPhase1Model.findOne({
          cohort: importData.cohort,
          cohesionCenterId: line["ID CENTRE"]?.toLowerCase(),
        });

        const busLineData = {
          cohort: importData.cohort,
          cohortId: importData.cohortId?.toLowerCase(),
          busId: line["NUMERO DE LIGNE"],
          codeCourtDeRoute: line["Code court de route"],
          departuredDate: parseDate(line["DATE DE TRANSPORT ALLER"], "dd/MM/yyyy", new Date()),
          returnDate: parseDate(line["DATE DE TRANSPORT RETOUR"], "dd/MM/yyyy", new Date()),
          centerId: line["ID CENTRE"]?.toLowerCase(),
          centerArrivalTime: formatTime(line["HEURE D'ARRIVEE AU CENTRE"]),
          centerDepartureTime: formatTime(line["HEURE DE DÉPART DU CENTRE"]),
          followerCapacity: line["TOTAL ACCOMPAGNATEURS"],
          youngCapacity: line["CAPACITÉ VOLONTAIRE TOTALE"],
          totalCapacity: line["CAPACITE TOTALE LIGNE"],
          youngSeatsTaken: 0,
          lunchBreak: (line["PAUSE DÉJEUNER ALLER"] || "").toLowerCase() === "oui",
          lunchBreakReturn: (line["PAUSE DÉJEUNER RETOUR"] || "").toLowerCase() === "oui",
          travelTime: formatTime(line["TEMPS DE ROUTE"]),
          sessionId: session?._id.toString(),
          meetingPointsIds: pdrIds,
          classeId: line["ID CLASSE"] ? line["ID CLASSE"].toLowerCase() : undefined,
          mergedBusIds: newMergedBusIds[line["NUMERO DE LIGNE"]] || [],
          mirrorBusId: line["LIGNE MIROIR"],
        };

        const newBusLine = new LigneBusModel(busLineData);
        const busLine = await newBusLine.save({ session: transaction });

        // Mise à jour des lignes fusionnées existantes
        await syncMergedBus({
          ligneBus: busLine,
          busIdsToUpdate: busLineData.mergedBusIds.filter((busId) => busId !== busLineData.busId),
          newMergedBusIds: busLineData.mergedBusIds,
          transaction: transaction,
        });

        if (line["LIGNE MIROIR"]) {
          // Mise à jour de la ligne miroir associée si nécessaire
          for (const [mi, mline] of lines.entries()) {
            if (mline["NUMERO DE LIGNE"] === line["LIGNE MIROIR"] && !mline["LIGNE MIROIR"]) {
              mline["LIGNE MIROIR"] = line["NUMERO DE LIGNE"];
            }
          }
        }

        const lineToPointWithCorrespondance: LineToPoint[] = Array.from({ length: countPdr }, (_, i) => i + 1).reduce((acc: LineToPoint[], pdrNumber) => {
          const pdrKey = `ID PDR ${pdrNumber}` as keyof ImportPlanTransportLine;
          const pdrValue = line[pdrKey]?.toString().toLowerCase();

          if (pdrNumber > 1 && !pdrValue) return acc;

          if (!["correspondance aller", "correspondance retour", "correspondance"].includes(pdrValue || "")) {
            acc.push({
              lineId: busLine._id.toString()?.toLowerCase(),
              meetingPointId: pdrValue as string,
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
              acc[acc.length - 1].stepPoints.push({
                type: "aller",
                address: line[`NOM + ADRESSE DU PDR ${pdrNumber}`] as string,
                departureHour: formatTime(line[`HEURE DEPART DU PDR ${pdrNumber}`] as string),
                returnHour: "",
                transportType: mapTransportType(line[`TYPE DE TRANSPORT PDR ${pdrNumber}`] as string),
              });
              acc[acc.length - 1].stepPoints.push({
                type: "retour",
                address: line[`NOM + ADRESSE DU PDR ${pdrNumber}`] as string,
                departureHour: "",
                returnHour: formatTime(line[`HEURE DE RETOUR ARRIVÉE AU PDR ${pdrNumber}`] as string),
                transportType: mapTransportType(line[`TYPE DE TRANSPORT PDR ${pdrNumber}`] as string),
              });
            } else {
              const isAller = pdrValue === "correspondance aller";
              acc[acc.length - 1].stepPoints.push({
                type: isAller ? "aller" : "retour",
                address: line[`NOM + ADRESSE DU PDR ${pdrNumber}`] as string,
                departureHour: isAller ? formatTime(line[`HEURE DEPART DU PDR ${pdrNumber}`] as string) : "",
                returnHour: isAller ? "" : formatTime(line[`HEURE DE RETOUR ARRIVÉE AU PDR ${pdrNumber}`] as string),
                transportType: mapTransportType(line[`TYPE DE TRANSPORT PDR ${pdrNumber}`] as string),
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
              cohortId: busLine.cohortId,
              busId: busLine.busId,
              codeCourtDeRoute: busLine.codeCourtDeRoute,
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
              centerCode: center?.code2022,
              centerArrivalTime: busLine.centerArrivalTime,
              centerDepartureTime: busLine.centerDepartureTime,
              pointDeRassemblements,
              classeId: busLine.classeId,
              mergedBusIds: busLine.mergedBusIds,
              mirrorBusId: busLine.mirrorBusId,
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
