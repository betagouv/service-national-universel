import { CreateListeDiffusionModel, UpdateListeDiffusionModel } from "@plan-marketing/core/ListeDiffusion.model";
import { IsEnum, IsNotEmpty, IsObject, IsString, ValidationOptions, registerDecorator } from "class-validator";
import { ListeDiffusionEnum, ListeDiffusionFiltres } from "snu-lib";

// Clés de ciblage acceptées : union des filtres proposés par l'admin sur les listes
// Volontaires (`getFilterArray`, admin/src/scenes/volontaires/utils) et Inscriptions
// (`getInscriptionFilterArray`, admin/src/scenes/inscription). Les filtres sont relus tels
// quels au moment de l'envoi des campagnes (requête ES sur l'index young) : une clé libre
// permettrait de cibler sur n'importe quel champ du document jeune.
export const LISTE_DIFFUSION_FILTER_KEYS = [
    "CNIFileNotValidOnStart",
    "academy",
    "allergies",
    "classeId",
    "cohesionStayMedicalFileReceived",
    "cohesionStayPresence",
    "cohort",
    "country",
    "departInform",
    "departSejourMotif",
    "department",
    "etablissementId",
    "frenchNationality",
    "gender",
    "grade",
    "handicap",
    "handicapInSameDepartment",
    "hasMeetingInformation",
    "hasNotes",
    "imageRight",
    "isRegionRural",
    "isTravelingByPlane",
    "ligneId",
    "originalCohort",
    "paiBeneficiary",
    "parentAllowSNU",
    "phase2ApplicationFilesType",
    "phase2ApplicationStatus",
    "ppsBeneficiary",
    "presenceJDM",
    "psc1Info",
    "qpv",
    "reducedMobilityAccess",
    "region",
    "roadCodeRefund",
    "schoolName",
    "sessionPhase1Id",
    "situation",
    "source",
    "specificAmenagment",
    "status",
    "statusMilitaryPreparationFiles",
    "statusPhase1",
    "statusPhase2",
    "statusPhase2Contract",
    "statusPhase3",
    "status_equivalence",
    "youngPhase1Agreement",
] as const;

const ALLOWED_FILTER_KEYS = new Set<string>(LISTE_DIFFUSION_FILTER_KEYS);

export function isListeDiffusionFiltres(value: unknown): value is ListeDiffusionFiltres {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }
    return Object.entries(value).every(
        ([key, values]) =>
            ALLOWED_FILTER_KEYS.has(key) && Array.isArray(values) && values.every((v) => typeof v === "string"),
    );
}

function IsListeDiffusionFiltres(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: "isListeDiffusionFiltres",
            target: object.constructor,
            propertyName,
            options: {
                message: `${propertyName} n'accepte que des filtres de ciblage connus, sous forme de listes de chaînes`,
                ...validationOptions,
            },
            validator: {
                validate: (value: unknown) => isListeDiffusionFiltres(value),
            },
        });
    };
}

export class CreateListeDiffusionDto implements CreateListeDiffusionModel {
    @IsString()
    @IsNotEmpty()
    nom: string;

    @IsEnum(ListeDiffusionEnum)
    @IsNotEmpty()
    type: ListeDiffusionEnum;

    @IsObject()
    @IsNotEmpty()
    @IsListeDiffusionFiltres()
    filters: ListeDiffusionFiltres;
}

export class UpdateListeDiffusionDto implements UpdateListeDiffusionModel {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    nom: string;

    @IsObject()
    @IsNotEmpty()
    @IsListeDiffusionFiltres()
    filters: ListeDiffusionFiltres;
}
