import { isYoungCanApplyToPhase2Missions } from "@/utils";
import { isCohortTooOld } from "snu-lib";

function getDiffYear(a, b) {
  const from = new Date(a);
  from.setHours(0, 0, 0, 0);
  const to = new Date(b);
  to.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(to - from);
  const res = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
  if (!res || isNaN(res)) return "?";
  return res;
}

export function getAuthorizationToApply(mission, young) {
  if (!mission || !young) {
    return { enabled: false, message: "Une erreur s'est produite" };
  }

  if (isCohortTooOld(young?.cohort)) {
    return { enabled: false, message: "Le délai pour candidater est dépassé." };
  }
  const applicationsCount = young?.phase2ApplicationStatus.filter((obj) => {
    return obj.includes("WAITING_VALIDATION" || "WAITING_VERIFICATION");
  }).length;
  if (!isYoungCanApplyToPhase2Missions(young)) {
    return { enabled: false, message: "Pour candidater, vous devez avoir terminé votre séjour de cohésion" };
  }
  if (applicationsCount >= 15) {
    return { enabled: false, message: "Vous ne pouvez candidater qu'à 15 missions différentes." };
  }

  // Military preparations have special rules
  const isMilitaryPreparation = mission?.isMilitaryPreparation === "true";
  const ageAtStart = getDiffYear(mission.startAt, young.birthdateAt);
  if (isMilitaryPreparation && ageAtStart < 16) {
    return { enabled: false, message: "Pour candidater, vous devez avoir plus de 16 ans (révolus le 1er jour de la Préparation militaire choisie)" };
  }
  if (isMilitaryPreparation && young.statusMilitaryPreparationFiles === "REFUSED") {
    return { enabled: false, message: "Vous n’êtes pas éligible aux préparations militaires. Vous ne pouvez pas candidater" };
  }
  const isMilitaryApplicationIncomplete =
    !young.files.militaryPreparationFilesIdentity.length || !young.files.militaryPreparationFilesAuthorization.length || !young.files.militaryPreparationFilesCertificate.length;
  if (isMilitaryPreparation && isMilitaryApplicationIncomplete) {
    return { enabled: false, message: "Pour candidater, veuillez téléverser le dossier d’éligibilité présent en bas de page" };
  }

  return { enabled: true, message: "" };
}
