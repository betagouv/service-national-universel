import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { CLASSE_IMPORT_EN_MASSE_COLUMNS } from "snu-lib";

export class ModifierReferentPayloadDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    nom: string;

    @IsNotEmpty()
    prenom: string;
}

export class InscriptionEnMasseValidationPayloadDto {
    @IsOptional()
    @IsObject()
    mapping: Record<CLASSE_IMPORT_EN_MASSE_COLUMNS, string>;
}

export class InscriptionEnMasseImportPayloadDto {
    @IsOptional()
    @IsObject()
    mapping: Record<CLASSE_IMPORT_EN_MASSE_COLUMNS, string>;

    @IsNotEmpty()
    @IsString()
    fileKey: string;
}

export class InscriptionManuellePayloadDto {
    @IsNotEmpty()
    @IsString()
    prenom: string;

    @IsNotEmpty()
    @IsString()
    nom: string;

    @IsNotEmpty()
    @IsString()
    dateDeNaissance: Date;

    @IsNotEmpty()
    @IsString()
    sexe: string;
}
