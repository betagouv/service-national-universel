import { CampagneModel, CreateCampagneModel } from "@plan-marketing/core/Campagne.model";
import { CampagneJeuneType, DestinataireListeDiffusion } from "snu-lib";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCampagneDto implements CreateCampagneModel {
    @IsString()
    @IsOptional()
    campagneGeneriqueId?: string;

    @IsString()
    @IsNotEmpty()
    nom: string;

    @IsString()
    @IsNotEmpty()
    objet: string;

    @IsString()
    @IsOptional()
    contexte?: string;

    @IsNumber()
    @IsNotEmpty()
    templateId: number;

    @IsString()
    @IsNotEmpty()
    listeDiffusionId: string;

    @IsBoolean()
    @IsNotEmpty()
    generic: boolean;

    @IsNotEmpty()
    @IsArray()
    destinataires: DestinataireListeDiffusion[];

    @IsEnum(CampagneJeuneType)
    @IsNotEmpty()
    type: CampagneJeuneType;
}

export class UpdateCampagneDto extends CreateCampagneDto implements CampagneModel {
    @IsString()
    @IsNotEmpty()
    id: string;
}
