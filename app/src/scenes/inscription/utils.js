import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { translate } from "../../utils";

export const STEPS = {
  PROFIL: "PROFIL",
  COORDONNEES: "COORDONNEES",
  AVAILABILITY: "AVAILABILITY",
  PARTICULIERES: "PARTICULIERES",
  REPRESENTANTS: "REPRESENTANTS",
  CONSENTEMENTS: "CONSENTEMENTS",
  DOCUMENTS: "DOCUMENTS",
  DONE: "DONE",
};

export const STEPS_2020 = {
  CONSENTEMENTS: "CONSENTEMENTS",
  COORDONNEES: "COORDONNEES",
  PARTICULIERES: "PARTICULIERES",
  JDC: "JDC",
  DONE: "DONE",
};

export const saveYoung = async (values) => {
  const { ok, code, data: young } = await api.put("/young", values);
  if (!ok) return toastr.error("Une erreur s'est produite lors de l'enregistrement de votre progression", translate(code));
  if (ok) toastr.success("Progression enregistrée");
  return young;
};

export const YOUNG_SITUATIONS = {
  GENERAL_SCHOOL: "GENERAL_SCHOOL",
  PROFESSIONAL_SCHOOL: "PROFESSIONAL_SCHOOL",
  AGRICULTURAL_SCHOOL: "AGRICULTURAL_SCHOOL",
  SPECIALIZED_SCHOOL: "SPECIALIZED_SCHOOL",
  APPRENTICESHIP: "APPRENTICESHIP",
  EMPLOYEE: "EMPLOYEE",
  INDEPENDANT: "INDEPENDANT",
  SELF_EMPLOYED: "SELF_EMPLOYED",
  ADAPTED_COMPANY: "ADAPTED_COMPANY",
  POLE_EMPLOI: "POLE_EMPLOI",
  MISSION_LOCALE: "MISSION_LOCALE",
  CAP_EMPLOI: "CAP_EMPLOI",
  NOTHING: "NOTHING", // @todo find a better key --'
};
