import { Types } from "mongoose";
import {
  LigneBusModel,
  LigneToPointModel,
  PlanTransportModel,
  YoungModel,
  CohortModel,
  PointDeRassemblementModel,
  ClasseModel,
  ClasseDocument,
  EtablissementModel,
  ReferentModel,
} from "../models";
import { COHORT_TYPE, CohortType, ERRORS, SENDINBLUE_TEMPLATES, UserDto, checkTime } from "snu-lib";
import { sendTemplate } from "../brevo";
import { YoungDocument } from "../models/young";

const { ObjectId } = Types;

interface YoungsUpdated extends YoungDocument {
  email: string;
  parent1Email: string;
  parent2Email: string;
  classeId?: string;
}

export const updatePDRForLine = async (
  ligneBusId: string,
  transportType: string,
  meetingHour: string,
  busArrivalHour: string,
  departureHour: string,
  returnHour: string,
  meetingPointId: string,
  newMeetingPointId: string,
  shouldSendEmailCampaign: boolean,
  user: UserDto,
) => {
  const ligneBus = await LigneBusModel.findById(ligneBusId);
  if (!ligneBus) throw new Error(ERRORS.NOT_FOUND);

  const cohort = await CohortModel.findOne({ name: ligneBus.cohort });
  if (!cohort) throw new Error(ERRORS.NOT_FOUND);

  if (checkTime(departureHour, meetingHour) || checkTime(departureHour, busArrivalHour)) {
    throw new Error(ERRORS.INVALID_BODY);
  }

  const ligneToPoint = await LigneToPointModel.findOne({ lineId: ligneBusId, meetingPointId });
  if (!ligneToPoint) throw new Error(ERRORS.NOT_FOUND);

  ligneToPoint.set({
    transportType,
    meetingHour,
    busArrivalHour,
    departureHour,
    returnHour,
    ...(meetingPointId !== newMeetingPointId && { meetingPointId: newMeetingPointId }),
  });

  await ligneToPoint.save({ fromUser: user });

  if (meetingPointId !== newMeetingPointId) {
    const meetingPointsIds = ligneBus.meetingPointsIds.filter((id) => id !== meetingPointId);
    meetingPointsIds.push(newMeetingPointId);
    ligneBus.set({ meetingPointsIds });
    await ligneBus.save({ fromUser: user });
  }

  const planDeTransport = await PlanTransportModel.findById(ligneBusId);
  if (!planDeTransport) throw new Error(ERRORS.NOT_FOUND);

  const pointDeRassemblement = await PointDeRassemblementModel.findById(new ObjectId(newMeetingPointId));
  if (!pointDeRassemblement) throw new Error(ERRORS.NOT_FOUND);

  const meetingPoint = planDeTransport.pointDeRassemblements.find((mp) => mp.meetingPointId === meetingPointId);
  if (!meetingPoint) throw new Error(ERRORS.NOT_FOUND);

  meetingPoint.set({
    meetingPointId: newMeetingPointId,
    ...pointDeRassemblement._doc,
    busArrivalHour: ligneToPoint.busArrivalHour,
    meetingHour: ligneToPoint.meetingHour,
    departureHour: ligneToPoint.departureHour,
    returnHour: ligneToPoint.returnHour,
    transportType: ligneToPoint.transportType,
  });

  await planDeTransport.save({ fromUser: user });

  const youngUpdateResult = await YoungModel.updateMany(
    {
      ligneId: ligneBusId,
      meetingPointId: meetingPointId,
    },
    {
      $set: {
        meetingPointId: newMeetingPointId,
      },
    },
    { fromUser: user },
  );

  if (shouldSendEmailCampaign) {
    const updatedYoungs: YoungsUpdated[] = await YoungModel.find({
      ligneId: ligneBusId,
      meetingPointId: newMeetingPointId,
    }).select("email parent1Email parent2Email classeId");

    await sendEmailCampaignToYoungAndRL(updatedYoungs, cohort);

    if (cohort.type === COHORT_TYPE.CLE) {
      const classe = await ClasseModel.findById(updatedYoungs[0].classeId);
      if (!classe) throw new Error(ERRORS.NOT_FOUND);
      await sendEmailCampaignToRefCLE(classe);
    }
  }

  return ligneBus;
};

const sendEmailCampaignToYoungAndRL = async (youngs: YoungsUpdated[], cohort: CohortType) => {
  let isBeforeDeparture = false;
  let templateId: string | null = null;
  if (new Date() < new Date(cohort.dateStart)) {
    isBeforeDeparture = true;
    templateId = SENDINBLUE_TEMPLATES.young.CHANGE_PDR_BEFORE_DEPARTURE;
  } else if (new Date() < new Date(cohort.dateEnd)) {
    templateId = SENDINBLUE_TEMPLATES.young.CHANGE_PDR_BEFORE_RETURN;
  }

  if (!templateId) throw new Error("Modification date is out of range, no email sent.");

  const sendEmails = async (youngs: YoungDocument[], sendToRL: boolean) => {
    for (const young of youngs) {
      const youngsParentMail: { email: string }[] = [];
      if (young.parent1Email) youngsParentMail.push({ email: young.parent1Email });
      if (young.parent2Email) youngsParentMail.push({ email: young.parent2Email });

      const contacts = sendToRL ? { emailTo: youngsParentMail, cc: [{ email: young.email }] } : { emailTo: [{ email: young.email }], cc: youngsParentMail };

      await sendTemplate(templateId, contacts);
    }
  };

  if (isBeforeDeparture) {
    await sendEmails(youngs, false);
  } else {
    const youngsFiltered = youngs.filter((young) => young.cohesionStayPresence !== "false" && young.departInform !== "true");
    await sendEmails(youngsFiltered, true);
  }
};

const sendEmailCampaignToRefCLE = async (classe: ClasseDocument) => {
  const etablissementId = classe.etablissementId;
  const etablissement = await EtablissementModel.findById(etablissementId);
  if (!etablissement) throw new Error(ERRORS.NOT_FOUND);
  const referentsCLEIds = [...classe.referentClasseIds, ...etablissement.referentEtablissementIds, ...etablissement.coordinateurIds];

  const referentsCLE = await ReferentModel.find({ _id: { $in: referentsCLEIds } }).select("email");

  for (const referent of referentsCLE) {
    await sendTemplate(SENDINBLUE_TEMPLATES.CLE.CHANGE_PDR, { emailTo: [{ email: referent.email }] });
  }
};
