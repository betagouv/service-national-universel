import { JeuneGenre } from "@admin/core/sejours/jeune/Jeune.model";
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class ModifierReferentPayloadDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    nom: string;

    @IsNotEmpty()
    prenom: string;
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
