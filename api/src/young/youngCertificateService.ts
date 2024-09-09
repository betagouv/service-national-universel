import {
  CohesionCenterModel,
  SessionPhase1Model,
  CohortModel,
  LigneBusModel,
  LigneToPointModel,
  PointDeRassemblementModel,
  DepartmentServiceModel,
  CohesionCenterType,
  PointDeRassemblementType,
} from "../models";
import { YoungDto } from "snu-lib";

export const getMeetingAddress = (young: YoungDto, meetingPoint: PointDeRassemblementType, center: CohesionCenterType) => {
  if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return `${center.address} ${center.zip} ${center.city}`;
  const complement = meetingPoint?.complementAddress.find((c) => c.cohort === young.cohort);
  const complementText = complement?.complement ? ", " + complement.complement : "";
  return meetingPoint.name + ", " + meetingPoint.address + " " + meetingPoint.zip + " " + meetingPoint.city + complementText;
};

export const getCertificateTemplate = (young: YoungDto) => {
  if (young.cohort === "Octobre 2023 - NC" && young.source !== "CLE") {
    return "convocation/convocation_template_base_NC.png";
  }
  return "convocation/convocation_template_base_2024_V2.png";
};

export const isLocalTransport = (young: YoungDto) => {
  return young.transportInfoGivenByLocal === "true";
};

export const fetchDataForYoungCertificate = async (young: YoungDto) => {
  const session = await SessionPhase1Model.findById(young.sessionPhase1Id);
  if (!session) throw new Error(`session ${young.sessionPhase1Id} not found for young ${young._id}`);
  const center = await CohesionCenterModel.findById(session.cohesionCenterId);
  if (!center) throw new Error(`center ${session.cohesionCenterId} not found for young ${young._id} - session ${session._id}`);

  const cohort = await CohortModel.findOne({ name: young.cohort });
  if (!cohort) throw new Error(`cohort ${young.cohort} not found for young ${young._id}`);
  cohort.dateStart.setMinutes(cohort.dateStart.getMinutes() - cohort.dateStart.getTimezoneOffset());
  cohort.dateEnd.setMinutes(cohort.dateEnd.getMinutes() - cohort.dateEnd.getTimezoneOffset());

  let service = null;
  if (young.source !== "CLE") {
    service = await DepartmentServiceModel.findOne({ department: young.department });
    if (!service) throw new Error(`service not found for young ${young._id}, center ${center?._id} in department ${young?.department}`);
  }

  let meetingPoint = null;
  let ligneToPoint = null;
  let ligneBus = null;
  if (!isLocalTransport(young)) {
    meetingPoint = await PointDeRassemblementModel.findById(young.meetingPointId);

    if (meetingPoint && young.ligneId) {
      ligneBus = await LigneBusModel.findById(young.ligneId);
      ligneToPoint = await LigneToPointModel.findOne({ lineId: young.ligneId, meetingPointId: young.meetingPointId });
    }
  }

  return { session, cohort, center, service, meetingPoint, ligneBus, ligneToPoint };
};
