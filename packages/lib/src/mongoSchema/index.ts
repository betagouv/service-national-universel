export type InterfaceExtended<T> = T & { _id: string; _doc?: T };

export * from "./constantes/collections";

export * from "./alerteMessage";
export * from "./application";
export * from "./areas";
export * from "./bus";
export * from "./cle/classe";
export * from "./cle/etablissement";
export * from "./cohesionCenter";
export * from "./cohort";
export * from "./cohortGroup";
export * from "./contract";
export * from "./departmentService";
export * from "./email";
export * from "./engagement/mission";
export * from "./engagement/missionAPI";
export * from "./engagement/missionEquivalence";
export * from "./event";
export * from "./featureFlag";
export * from "./filters";
export * from "./inscriptionGoal";
export * from "./meetingPoint";
export * from "./planDeTransport/importPlanTransport";
export * from "./planDeTransport/ligneBus";
export * from "./planDeTransport/ligneToPoint";
export * from "./planDeTransport/modificationBus";
export * from "./planDeTransport/planTransport";
export * from "./planDeTransport/pointDeRassemblement";
export * from "./planDeTransport/schemaDeRepartition";
export * from "./planDeTransport/tableDeRepartition";
export * from "./program";
export * from "./referent";
export * from "./referentiel/regionAcademique";
export * from "./referentiel/departement";
export * from "./referentiel/academie";
export * from "./sessionPhase1";
export * from "./sessionPhase1Token";
export * from "./school";
export * from "./schoolRAMSES";
export * from "./structure";
export * from "./tags";
export * from "./task";
export * from "./waitingList";
export * from "./young";
export * from "./patch";
export * from "./campagne";
export * from "./listeDiffusion";
export * from "./permissions/permission";
export * from "./permissions/role";
export * from "./types";
export * from "../utils/patchUtils";
