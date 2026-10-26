import {
    IsArray,
    IsMongoId,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    ValidationOptions,
    registerDecorator,
} from "class-validator";

import { MISSION_EXPORT_FILTER_KEYS } from "@admin/core/engagement/mission/ExportMission.service";

const ALLOWED_FILTER_KEYS = new Set<string>(MISSION_EXPORT_FILTER_KEYS);

// L39 : une clé inconnue deviendrait un `terms` sur un champ arbitraire de l'index mission. On la
// refuse plutôt que de l'ignorer, pour ne pas élargir silencieusement un export.
export function isMissionExportFiltres(value: unknown): value is Record<string, string | string[]> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }
    return Object.entries(value).every(
        ([key, values]) =>
            ALLOWED_FILTER_KEYS.has(key) &&
            (typeof values === "string" || (Array.isArray(values) && values.every((v) => typeof v === "string"))),
    );
}

function IsMissionExportFiltres(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: "isMissionExportFiltres",
            target: object.constructor,
            propertyName,
            options: {
                message: `${propertyName} n'accepte que les filtres de la liste des missions, sous forme de chaînes`,
                ...validationOptions,
            },
            validator: {
                validate: (value: unknown) => isMissionExportFiltres(value),
            },
        });
    };
}

export class PostCandidaturesExportPayloadDto {
    @IsObject()
    @IsNotEmpty()
    @IsMissionExportFiltres()
    filters: Record<string, string | string[]>;

    @IsArray()
    @IsString({ each: true })
    fields: string[];

    @IsString()
    @IsOptional()
    searchTerm?: string;
}

export class PostMissionsExportPayloadDto {
    @IsObject()
    @IsNotEmpty()
    @IsMissionExportFiltres()
    filters: Record<string, string | string[]>;

    @IsArray()
    @IsString({ each: true })
    fields: string[];

    @IsString()
    @IsOptional()
    searchTerm?: string;
}
