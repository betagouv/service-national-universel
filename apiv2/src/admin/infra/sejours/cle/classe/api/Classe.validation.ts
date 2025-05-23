import { JeuneGenre } from "@admin/core/sejours/jeune/Jeune.model";
import { IsEmail, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from "class-validator";
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
    @MaxLength(255)
    prenom: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    nom: string;

    @IsNotEmpty()
    @IsString()
    dateDeNaissance: Date;

    @IsNotEmpty()
    @IsEnum(JeuneGenre)
    sexe: JeuneGenre;
}
