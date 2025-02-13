import { Types } from "mongoose";
import { LigneBusModel, LigneToPointModel, PlanTransportModel, YoungModel, CohortModel, PointDeRassemblementModel } from "../models";
import { CohortType, ERRORS, SENDINBLUE_TEMPLATES, UserDto, checkTime } from "snu-lib";
import { sendTemplate } from "../brevo";

const { ObjectId } = Types;

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
    await sendEmailCampaign(ligneBusId, newMeetingPointId, cohort);
  }

  return ligneBus;
};

const sendEmailCampaign = async (ligneBusId: string, newMeetingPointId: string, cohort: CohortType) => {
  const updatedYoungs = await YoungModel.find({
    ligneId: ligneBusId,
    meetingPointId: newMeetingPointId,
  }).select("email parent1Email parent2Email");

  let isBeforeDeparture = false;
  let templateId: string | null = null;
  if (new Date() < new Date(cohort.dateStart)) {
    isBeforeDeparture = true;
    templateId = SENDINBLUE_TEMPLATES.young.CHANGE_PDR_BEFORE_DEPARTURE;
  } else if (new Date() < new Date(cohort.dateEnd)) {
    templateId = SENDINBLUE_TEMPLATES.young.CHANGE_PDR_BEFORE_RETURN;
  }

  if (!templateId) throw new Error("Modification date is out of range, no email sent.");

  for (const young of updatedYoungs) {
    const cc: { email: string }[] = [];
    if (young.parent1Email) cc.push({ email: young.parent1Email });
    if (young.parent2Email) cc.push({ email: young.parent2Email });

    const contacts = isBeforeDeparture
      ? {
          emailTo: [{ email: young.email }],
          cc,
        }
      : {
          emailTo: cc,
        };

    await sendTemplate(templateId, contacts);
  }
};
