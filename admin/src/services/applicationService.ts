import API from "@/services/api";
import { toastr } from "react-redux-toastr";
import { APPLICATION_STATUS, COHORT_STATUS, MissionType, SENDINBLUE_TEMPLATES, YoungType } from "snu-lib";

export async function getApplicationsByMissionId(missionId: string) {
  const { ok, data } = await API.get(`/mission/${missionId}/application`);
  if (!ok) throw new Error("Erreur lors de la récupération des candidatures");
  return data;
}

export async function createApplication({ mission, young }: { mission: MissionType; young: YoungType }) {
  const application = {
    status: APPLICATION_STATUS.WAITING_ACCEPTATION,
    youngId: young._id,
    youngFirstName: young.firstName,
    youngLastName: young.lastName,
    youngEmail: young.email,
    youngBirthdateAt: young.birthdateAt,
    youngCity: young.city,
    youngDepartment: young.department,
    youngCohort: young.cohort,
    missionId: mission._id,
    missionName: mission.name,
    missionDepartment: mission.department,
    missionRegion: mission.region,
    structureId: mission.structureId,
    tutorId: mission.tutorId,
    tutorName: mission.tutorName,
  };
  const { ok, code, data } = await API.post(`/application`, application);
  if (!ok) throw new Error(code);
  return data;
}

export async function sendNotificationApplicationWasCreated({ mission, young }: { mission: MissionType; young: YoungType }) {
  const { ok: cohortOk, data: cohort } = await API.get(`/cohort/${young.cohort}`);
  if (!cohortOk) return toastr.error("Impossible de récupérer les informations de la cohorte", "");

  if (cohort.status === COHORT_STATUS.FULLY_ARCHIVED) {
    return;
  }

  if (cohort.status === COHORT_STATUS.ARCHIVED) {
    const hasCompletedMission = young.phase2ApplicationStatus?.some((status) => status === APPLICATION_STATUS.DONE);
    if (!hasCompletedMission) {
      return;
    }
  }

  let template = "";
  if (mission.isMilitaryPreparation === "true") {
    template = SENDINBLUE_TEMPLATES.young.MISSION_PROPOSITION_PM;
  } else {
    template = SENDINBLUE_TEMPLATES.young.MISSION_PROPOSITION;
  }
  const { ok: ok, code: code } = await API.post(`/young/${young._id}/email/${template}`, {
    missionName: mission.name,
    structureName: mission.structureName,
  });
  if (!ok) return toastr.error("Oups, une erreur est survenue lors de l'envoi du mail", code || "");
  else toastr.success("Email envoyé !", "");
}
