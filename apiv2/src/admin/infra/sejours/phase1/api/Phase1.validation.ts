import { IsEnum, IsIn, IsMongoId, ValidateIf } from "class-validator";

import { TaskName, TaskStatus } from "snu-lib";

export const PHASE1_SIMULATIONS_TASK_NAMES = [
    TaskName.AFFECTATION_HTS_SIMULATION,
    TaskName.AFFECTATION_HTS_DROMCOM_SIMULATION,
    TaskName.AFFECTATION_CLE_SIMULATION,
    TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION,
    TaskName.BACULE_JEUNES_VALIDES_SIMULATION,
    TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION,
    TaskName.DESISTEMENT_POST_AFFECTATION_SIMULATION,
];
export const PHASE1_TRAITEMENTS_TASK_NAMES = [
    TaskName.AFFECTATION_HTS_SIMULATION_VALIDER,
    TaskName.AFFECTATION_HTS_DROMCOM_SIMULATION_VALIDER,
    TaskName.AFFECTATION_CLE_SIMULATION_VALIDER,
    TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION_VALIDER,
    TaskName.BACULE_JEUNES_VALIDES_SIMULATION_VALIDER,
    TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION_VALIDER,
    TaskName.DESISTEMENT_POST_AFFECTATION_VALIDER,
];

// Le front envoie `?name=` quand aucun filtre n'est choisi : une chaîne vide vaut absence.
const isProvided = (value: unknown) => value !== undefined && value !== null && value !== "";

export class DeleteLigneDeBusParamsDto {
    @IsMongoId()
    sessionId: string;

    @IsMongoId()
    ligneId: string;
}

// Chaque paramètre est borné à une liste fermée : un objet (`?name[$ne]=x`) est refusé
// avant d'atteindre le filtre Mongo, et `name` ne sort pas de la famille de tâches listée.
export class GetSimulationsQueryDto {
    @ValidateIf((o) => isProvided(o.name))
    @IsIn(PHASE1_SIMULATIONS_TASK_NAMES)
    name?: TaskName;

    @ValidateIf((o) => isProvided(o.status))
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @ValidateIf((o) => isProvided(o.sort))
    @IsIn(["ASC", "DESC"])
    sort?: "ASC" | "DESC";
}

export class GetTraitementsQueryDto {
    @ValidateIf((o) => isProvided(o.name))
    @IsIn(PHASE1_TRAITEMENTS_TASK_NAMES)
    name?: TaskName;

    @ValidateIf((o) => isProvided(o.status))
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @ValidateIf((o) => isProvided(o.sort))
    @IsIn(["ASC", "DESC"])
    sort?: "ASC" | "DESC";
}
