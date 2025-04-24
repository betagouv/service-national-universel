import { CohesionCenterModel, SessionPhase1Model, CohortModel, LigneBusModel, LigneToPointModel, PointDeRassemblementModel, DepartmentServiceModel } from "../models";
import { YoungDto, PointDeRassemblementType, CohesionCenterType, getParticularitesAcces } from "snu-lib";

export const getMeetingAddress = (young: YoungDto, pdr: PointDeRassemblementType, centre: CohesionCenterType) => {
  if (young.deplacementPhase1Autonomous === "true" || !pdr) return `${centre.address} ${centre.zip} ${centre.city}`;
  const complement = getParticularitesAcces(pdr, young.cohort);
  const complementText = complement ? ", " + complement : "";
  return `${pdr.name}, ${pdr.address} ${pdr.zip} ${pdr.city}${complementText}`;
};

export const getCertificateTemplate = (young: YoungDto) => {
  if (young.cohort === "Octobre 2023 - NC" && young.source !== "CLE") {
    return "convocation/convocation_template_base_NC.png";
  }
  return "convocation/convocation_template_base_2024_V3.png";
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
