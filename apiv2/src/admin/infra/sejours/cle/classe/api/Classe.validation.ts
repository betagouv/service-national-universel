import { IsEmail, IsNotEmpty } from "class-validator";

export class ModifierReferentPayloadDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    nom: string;

    @IsNotEmpty()
    prenom: string;
}
