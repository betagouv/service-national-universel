import dayjs from "@/utils/dayjs.utils";
import * as XLSX from "xlsx";

import {
  canUpdateCenter,
  canUpdateCohort,
  isNowBetweenDates,
  ROLES,
  STATUS_CLASSE,
  canEditEstimatedSeats,
  canEditTotalSeats,
  TYPE_CLASSE_LIST,
  CLE_GRADE_LIST,
  CLE_FILIERE_LIST,
  translateColoration,
  translateGrade,
  CLE_COLORATION_LIST,
  translate,
  ClasseType,
  isAdmin,
  translateStatusClasse,
  ReferentType,
  translateAction,
} from "snu-lib";
import { CohortDto } from "snu-lib/src/dto";
import api from "@/services/api";
import { User } from "@/types";
import { translateModelFields } from "@/utils";
export const statusClassForBadge = (status) => {
  let statusClasse;

  switch (status) {
    case STATUS_CLASSE.CREATED:
      statusClasse = "WAITING_LIST";
      break;

    case STATUS_CLASSE.VERIFIED:
      statusClasse = "WAITING_VALIDATION";
      break;

    case STATUS_CLASSE.ASSIGNED:
      statusClasse = "WAITING_VALIDATION";
      break;

    case STATUS_CLASSE.WITHDRAWN:
      statusClasse = "REFUSED";
      break;
    case STATUS_CLASSE.CLOSED:
      statusClasse = "CANCEL";
      break;
    case STATUS_CLASSE.OPEN:
      statusClasse = "VALIDATED";
      break;

    default:
      statusClasse = null;
      break;
  }
  return statusClasse;
};

export function getRights(user: User, classe?: Pick<ClasseType, "status" | "schoolYear">, cohort?: CohortDto) {
  if (!user || !classe) return {};
  return {
    canEdit:
      ([ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role) && classe?.status !== STATUS_CLASSE.WITHDRAWN) ||
      (classe?.status !== STATUS_CLASSE.WITHDRAWN && classe?.schoolYear === "2024-2025" && [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role)),
    canEditEstimatedSeats: canEditEstimatedSeats(user),
    canEditTotalSeats: canEditTotalSeats(user),
    canEditColoration: [ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role),
    canEditRef: [ROLES.ADMIN, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role),

    canEditCohort: cohort ? canUpdateCohort(cohort, user) : isAdmin(user) && classe.status === STATUS_CLASSE.VERIFIED,
    canEditCenter: cohort ? canUpdateCenter(cohort, user) : false,
    canEditPDR: cohort ? isAdmin(user) : false,
    showCohort: showCohort(cohort, user, classe),
    showCenter: cohort ? showCenter(cohort, user) : false,
    showPDR: cohort ? showPdr(cohort, user) : false,
  };
}

const showCohort = (cohort: CohortDto | undefined, user: User | undefined, classe: Pick<ClasseType, "status">): boolean => {
  if (!user) return false;
  if (!cohort) return isAdmin(user) && classe.status === STATUS_CLASSE.VERIFIED;
  let showCohort = [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user?.role);
  if (!showCohort && user?.role === ROLES.ADMINISTRATEUR_CLE) {
    showCohort = !!cohort.cleDisplayCohortsForAdminCLE && isNowBetweenDates(cohort.cleDisplayCohortsForAdminCLEDate?.from, cohort.cleDisplayCohortsForAdminCLEDate?.to);
  }
  if (!showCohort && user?.role === ROLES.REFERENT_CLASSE) {
    showCohort =
      !!cohort.cleDisplayCohortsForReferentClasse && isNowBetweenDates(cohort.cleDisplayCohortsForReferentClasseDate?.from, cohort.cleDisplayCohortsForReferentClasseDate?.to);
  }
  return showCohort;
};

const showCenter = (cohort: CohortDto | undefined, user: User | undefined): boolean => {
  if (!user || !cohort) return false;
  let showCenter = [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user?.role);
  if (!showCenter && user?.role === ROLES.ADMINISTRATEUR_CLE) {
    showCenter = !!cohort.cleDisplayCentersForAdminCLE && isNowBetweenDates(cohort.cleDisplayCentersForAdminCLEDate?.from, cohort.cleDisplayCentersForAdminCLEDate?.to);
  }
  if (!showCenter && user?.role === ROLES.REFERENT_CLASSE) {
    showCenter =
      !!cohort.cleDisplayCentersForReferentClasse && isNowBetweenDates(cohort.cleDisplayCentersForReferentClasseDate?.from, cohort.cleDisplayCentersForReferentClasseDate?.to);
  }
  return showCenter;
};

const showPdr = (cohort: CohortDto | undefined, user: User | undefined): boolean => {
  if (!user || !cohort) return false;
  let showPdr = [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user?.role);
  if (!showPdr && user?.role === ROLES.ADMINISTRATEUR_CLE) {
    showPdr = !!cohort.cleDisplayPDRForAdminCLE && isNowBetweenDates(cohort.cleDisplayPDRForAdminCLEDate?.from, cohort.cleDisplayPDRForAdminCLEDate?.to);
  }
  if (!showPdr && user?.role === ROLES.REFERENT_CLASSE) {
    showPdr = !!cohort.cleDisplayPDRForReferentClasse && isNowBetweenDates(cohort.cleDisplayPDRForReferentClasseDate?.from, cohort.cleDisplayPDRForReferentClasseDate?.to);
  }
  return showPdr;
};

export const searchSessions = async ({ q, cohort }) => {
  if (!cohort || cohort === "CLE 23-24") return [];

  const query = {
    filters: {
      cohort: [cohort],
    },
    page: 0,
    size: 10,
  };
  // @ts-ignore
  if (q) query.filters.searchbar = [q];

  const { responses } = await api.post(`/elasticsearch/sessionphase1/search?needCohesionCenterInfo=true`, query);
  return responses[0].hits.hits.map((hit) => {
    return {
      value: hit._source,
      _id: hit._id,
      label: hit._source.cohesionCenter.name,
      session: { ...hit._source, _id: hit._id },
    };
  });
};

export const searchPointDeRassemblements = async ({ q, cohort }) => {
  if (!cohort || cohort === "CLE 23-24") return [];

  const query = {
    filters: {
      cohorts: [cohort],
    },
    page: 0,
    size: 10,
  };
  // @ts-ignore
  if (q) query.filters.searchbar = [q];

  const { responses } = await api.post(`/elasticsearch/pointderassemblement/search`, query);
  return responses[0].hits.hits.map((hit) => {
    return {
      value: hit._source,
      _id: hit._id,
      label: `${hit._source.name}, ${hit._source.department}`,
      pointDeRassemblement: { ...hit._source, _id: hit._id },
    };
  });
};

export const colorOptions: {
  value: string;
  label: string;
}[] = Object.keys(CLE_COLORATION_LIST).map((value) => ({
  value: CLE_COLORATION_LIST[value],
  label: translateColoration(CLE_COLORATION_LIST[value]),
}));
export const filiereOptions = Object.keys(CLE_FILIERE_LIST).map((value) => ({
  value: CLE_FILIERE_LIST[value],
  label: CLE_FILIERE_LIST[value],
}));
export const gradeOptions = CLE_GRADE_LIST.filter((value) => value !== "CAP").map((value) => ({
  value: value,
  label: translateGrade(value),
}));
export const typeOptions = Object.keys(TYPE_CLASSE_LIST).map((value) => ({
  value: TYPE_CLASSE_LIST[value],
  label: translate(TYPE_CLASSE_LIST[value]),
}));

interface ReferentClasse extends ReferentType {
  state: string;
}

export interface ClasseExport extends ClasseType {
  referents: ReferentClasse[];
  referentEtablissement: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    state: string;
    _id: string;
  }[];
  coordinateurs: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  }[];
  studentInProgress: number;
  studentWaitingValidation: number;
  studentWaitingCorrection: number;
  studentValidated: number;
  studentAbandoned: number;
  studentNotAutorized: number;
  studentWithdrawn: number;
  studentAffected: number;
  openFiles: number;
}

export type typeExport = "export-des-classes" | "schema-de-repartition";

export function exportExcelSheet(classes: ClasseExport[], type: typeExport) {
  let sheetData;
  let headers;
  if (type === "export-des-classes") {
    sheetData = classes.map((c) => ({
      //classe
      id: c._id.toString(),
      uniqueKeyAndId: c.uniqueKeyAndId,
      dossier: c.metadata?.numeroDossierDS ?? "Non renseigné",
      name: c.name,
      schoolYear: c.schoolYear,
      cohort: c.cohort ?? "Non renseigné",
      coloration: c.coloration,
      status: translateStatusClasse(c.status),
      estimatedSeats: c.estimatedSeats,
      totalSeats: c.totalSeats,
      seatsTaken: c.seatsTaken,
      openFiles: c.openFiles ?? 0,
      studentInProgress: c.studentInProgress ?? 0,
      studentWaitingValidation: c.studentWaitingValidation ?? 0,
      studentWaitingCorrection: c.studentWaitingCorrection ?? 0,
      studentAffected: c.studentAffected ?? 0,
      studentWithdrawn: c.studentWithdrawn ?? 0,
      academy: c.academy,
      region: c.region,
      department: c.department,
      type: translate(c.type),
      createdAt: dayjs(c.createdAt).format("DD/MM/YYYY HH:mm"),
      updatedAt: dayjs(c.updatedAt).format("DD/MM/YYYY HH:mm"),
      // ref classe
      classeRefId: c.referents?.length ? c.referents[0]?._id : "",
      classeRefLastName: c.referents?.length ? `${c.referents[0]?.lastName}` : "",
      classeReFirstName: c.referents?.length ? `${c.referents[0]?.firstName}` : "",
      classeRefPhone: c.referents ? c.referents[0]?.phone : "",
      classeRefEmail: c.referents ? c.referents[0]?.email : "",
      classeRefActive: c.referents ? c.referents[0]?.state : "",
      //etablissement
      uai: c.etablissement?.uai,
      etablissementName: c.etablissement?.name,
      // chef d'etablissement
      etabRefId: c.referentEtablissement.length ? c.referentEtablissement[0]?._id : "",
      etabRefLastName: c.referentEtablissement.length ? `${c.referentEtablissement[0]?.lastName}` : "",
      etabRefFirstName: c.referentEtablissement.length ? `${c.referentEtablissement[0]?.firstName}` : "",
      etabRefPhone: c.referentEtablissement ? c.referentEtablissement[0]?.phone : "",
      etabRefEmail: c.referentEtablissement ? c.referentEtablissement[0]?.email : "",
      etabRefActive: c.referentEtablissement ? c.referentEtablissement[0]?.state : "",
      //coordinateurs
      coordinateur1LastName: c.coordinateurs.length ? `${c.coordinateurs[0]?.lastName}` : "",
      coordinateur1FirstName: c.coordinateurs.length ? `${c.coordinateurs[0]?.firstName}` : "",
      coordinateur1Phone: c.coordinateurs ? c.coordinateurs[0]?.phone : "",
      coordinateur1Email: c.coordinateurs ? c.coordinateurs[0]?.email : "",
      coordinateur2LastName: c.coordinateurs.length > 1 ? `${c.coordinateurs[1]?.lastName}` : "",
      coordinateur2FirstName: c.coordinateurs.length > 1 ? `${c.coordinateurs[1]?.firstName}` : "",
      coordinateur2Phone: c.coordinateurs ? c.coordinateurs[1]?.phone : "",
      coordinateur2Email: c.coordinateurs ? c.coordinateurs[1]?.email : "",
    }));

    headers = [
      "ID",
      "Clé unique de la classe",
      "Numéro de dossier DS",
      "Nom",
      "Année scolaire",
      "Cohorte",
      "Coloration",
      "Statut",
      "Effectif prévisionnel",
      "Effectif ajusté",
      "Élèves validés",
      "Dossiers ouverts",
      "Élèves en cours d'inscription",
      "Élèves en attente de validation",
      "Élèves en attente de correction",
      "Élèves affectés",
      "Élèves désistés",
      "Académie",
      "Région",
      "Département",
      "Type",
      "Date de création",
      "Dernière modification",
      "ID du référent de classe",
      "Nom du référent de classe",
      "Prénom du référent de classe",
      "Téléphone du référent de classe",
      "Email du référent de classe",
      "Statut du référent de classe",
      "UAI de l'établissement",
      "Nom de l'établissement",
      "ID du chef d'établissement",
      "Nom du chef d'établissement",
      "Prénom du chef d'établissement",
      "Téléphone du chef d'établissement",
      "Email du chef d'établissement",
      "Statut du chef d'établissement",
      "Nom du coordinateur 1",
      "Prénom du coordinateur 1",
      "Téléphone du coordinateur 1",
      "Email du coordinateur 1",
      "Nom du coordinateur 2",
      "Prénom du coordinateur 2",
      "Téléphone du coordinateur 2",
      "Email du coordinateur 2",
    ];
  }

  if (type === "schema-de-repartition") {
    sheetData = classes.map((c) => ({
      cohort: c.cohort,
      id: c._id.toString(),
      name: c.name,
      coloration: c.coloration,
      updatedAt: dayjs(c.updatedAt).format("DD/MM/YYYY HH:mm"),
      region: c.etablissement?.region,
      department: c.etablissement?.department,
      uai: c.etablissement?.uai,
      etablissementName: c.etablissement?.name,
      classeRefLastName: c.referents ? `${c.referents[0]?.lastName}` : "",
      classeRefFirstName: c.referents ? `${c.referents[0]?.firstName}` : "",
      classeRefPhone: c.referents ? c.referents[0]?.phone : "",
      classeRefEmail: c.referents ? c.referents[0]?.email : "",
      youngsVolume: c.totalSeats ?? 0,
      openFiles: c.openFiles ?? 0,
      studentInProgress: c.studentInProgress,
      studentWaitingValidation: c.studentWaitingValidation ?? 0,
      studentWaitingCorrection: c.studentWaitingCorrection ?? 0,
      studentAffected: c.studentAffected ?? 0,
      studentValidated: c.studentValidated,
      studentAbandoned: c.studentAbandoned,
      studentNotAutorized: c.studentNotAutorized,
      studentWithdrawn: c.studentWithdrawn,
      centerId: c.cohesionCenterId,
      centerMatricule: c.cohesionCenter?.matricule,
      centerName: c.cohesionCenter ? `${c.cohesionCenter?.name}, ${c.cohesionCenter?.address}, ${c.cohesionCenter?.zip} ${c.cohesionCenter?.city}` : "",
      centerDepartment: c.cohesionCenter?.department,
      centerRegion: c.cohesionCenter?.region,
      pointDeRassemblementId: c.pointDeRassemblementId,
      pointDeRassemblementMatricule: c.pointDeRassemblement?.matricule,
      pointDeRassemblementName: c.pointDeRassemblement?.name,
      pointDeRassemblementAddress: c.pointDeRassemblement ? `${c.pointDeRassemblement?.address}, ${c.pointDeRassemblement?.zip} ${c.pointDeRassemblement?.city}` : "",
    }));

    // tri par centre
    sheetData.sort((a, b) => {
      const aname = a.centerName;
      const bname = b.centerName;

      if (aname) {
        if (bname) return aname.localeCompare(bname);
        return -1;
      } else {
        if (bname) return 1;
        return 0;
      }
    });

    // --- fix header names
    headers = [
      "Cohorte",
      "ID de la classe",
      "Nom de la classe",
      "Coloration",
      "Date de dernière modification",
      "Région des volontaires",
      "Département des volontaires",
      "UAI de l'établissement",
      "Nom de l'établissement",
      "Nom du référent de classe",
      "Prénom du référent de classe",
      "Téléphone du référent de classe",
      "Email du référent de classe",
      "Nombre de places total",
      "Dossiers ouverts",
      "Nombre d'élèves en cours",
      "Nombre d'élèves en attente de validation",
      "Nombre d'élèves en attente de correction",
      "Nombre d'élèves affectés",
      "Nombre d'élèves validés",
      "Nombre d'élèves abandonnés",
      "Nombre d'élèves non autorisés",
      "Nombre d'élèves désistés",
      "ID centre",
      "Matricule du centre",
      "Désignation du centre",
      "Département du centre",
      "Région du centre",
      "ID du point de rassemblement",
      "Matricule du point de rassemblement",
      "Désignation du point de rassemblement",
      "Adresse du point de rassemblement",
    ];
  }

  const sheet = XLSX.utils.json_to_sheet(sheetData);
  XLSX.utils.sheet_add_aoa(sheet, [headers], { origin: "A1" });

  // --- create workbook
  const workbook = XLSX.utils.book_new();
  // ⚠️ Becareful, sheet name length is limited to 31 characters
  XLSX.utils.book_append_sheet(workbook, sheet, type === "schema-de-repartition" ? "Répartition des classes" : "Liste des classes");
  const fileName = type === "schema-de-repartition" ? "classes-schema-repartition.xlsx" : "classes_list.xlsx";
  return { workbook, fileName };
}

interface SelectOption {
  value: string;
  label: string;
}

export function getPathOptions(patches) {
  if (!patches) return [];
  const pathOptions: SelectOption[] = patches.flatMap((patch) =>
    patch.ops.map((op) => ({
      value: op.path,
      label: translateModelFields("classe", op.path.slice(1)),
    })),
  );
  const uniquePathOptions: SelectOption[] = Array.from(new Map(pathOptions.map((item) => [item.value, item])).values());
  return uniquePathOptions;
}

export function getActionOptions(patches) {
  if (!patches) return [];
  const actionOptions: SelectOption[] = patches.flatMap((patch) =>
    patch.ops.map((op) => ({
      value: op.op,
      label: translateAction(op.op),
    })),
  );
  const uniqueActionOptions: SelectOption[] = Array.from(new Map(actionOptions.map((item) => [item.value, item])).values());
  return uniqueActionOptions;
}

export function getValueOptions(patches) {
  if (!patches) return [];
  const valueOptions: SelectOption[] = patches.flatMap((patch) =>
    patch.ops.map((op) => ({
      value: op.value,
      label: translate(op.value),
    })),
  );
  const uniqueValueOptions: SelectOption[] = Array.from(new Map(valueOptions.map((item) => [item.value, item])).values());
  return uniqueValueOptions;
}

export function getUserOptions(patches) {
  if (!patches) return [];
  const userOptions: SelectOption[] = patches.flatMap((patch) => {
    if (!patch.user || !patch.user.lastName) return [];
    return {
      value: patch.user.firstName,
      label: patch.user.lastName ? `${patch.user.firstName} ${patch.user.lastName}` : patch.user.firstName,
    };
  });
  const uniqueUserOptions: SelectOption[] = Array.from(new Map(userOptions.map((item) => [item.value, item])).values());
  return uniqueUserOptions;
}

export function getYoungOptions(patches) {
  if (!patches) return [];
  const youngOptions: SelectOption[] = patches.flatMap((patch) => {
    if (!patch.young) return [];
    return {
      value: patch.young.firstName,
      label: `${patch.young.firstName} ${patch.young.lastName}`,
    };
  });
  const uniqueYoungOptions: SelectOption[] = Array.from(new Map(youngOptions.map((item) => [item.value, item])).values());
  return uniqueYoungOptions;
}

export function NormalizeYoungName(name: string) {
  return name
    .trim()
    .replace(/[.,\s]/g, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
