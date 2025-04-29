import { IsEmail, IsNotEmpty, IsObject, IsOptional } from "class-validator";
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
