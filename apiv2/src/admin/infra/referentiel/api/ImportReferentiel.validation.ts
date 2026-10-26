import { Type } from "class-transformer";
import { IsEnum, IsIn, IsInt, Max, Min, ValidateIf } from "class-validator";

import { ReferentielTaskType, TaskName, TaskStatus } from "snu-lib";

export const REFERENTIEL_TASK_NAMES = [TaskName.REFERENTIEL_IMPORT];

// Le front envoie `?name=` quand aucun filtre n'est choisi : une chaîne vide vaut absence.
const isProvided = (value: unknown) => value !== undefined && value !== null && value !== "";

// Chaque paramètre est borné à une liste fermée : un objet (`?status[$ne]=x`) est refusé
// avant d'atteindre le filtre Mongo.
export class GetImportsQueryDto {
    @ValidateIf((o) => isProvided(o.name))
    @IsIn(REFERENTIEL_TASK_NAMES)
    name?: TaskName.REFERENTIEL_IMPORT;

    @ValidateIf((o) => isProvided(o.type))
    @IsEnum(ReferentielTaskType)
    type?: ReferentielTaskType;

    @ValidateIf((o) => isProvided(o.status))
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @ValidateIf((o) => isProvided(o.sort))
    @IsIn(["ASC", "DESC"])
    sort?: "ASC" | "DESC";

    @ValidateIf((o) => isProvided(o.limit))
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number;
}
