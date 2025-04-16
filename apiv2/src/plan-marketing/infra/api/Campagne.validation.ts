import {
    CreateCampagneGeneriqueModel,
    CampagneGeneriqueModel,
    CreateCampagneSpecifiqueModelWithRef,
    CreateCampagneSpecifiqueModelWithoutRef,
} from "@plan-marketing/core/Campagne.model";
import { CampagneJeuneType, DestinataireListeDiffusion } from "snu-lib";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber } from "class-validator";
import { CampagneProgrammation } from "@plan-marketing/core/Programmation.model";

class BaseCampagneDto {
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

    @IsNotEmpty()
    @IsArray()
    destinataires: DestinataireListeDiffusion[];

    @IsEnum(CampagneJeuneType)
    @IsNotEmpty()
    type: CampagneJeuneType;

    @IsBoolean()
    @IsNotEmpty()
    isProgrammationActive: boolean = false;

    @IsBoolean()
    @IsOptional()
    isArchived?: boolean = false;
}

export class CreateCampagneGeneriqueDto extends BaseCampagneDto implements CreateCampagneGeneriqueModel {
    @IsBoolean()
    @IsNotEmpty()
    generic: true = true;

    @IsArray()
    @IsNotEmpty()
    programmations: CampagneProgrammation[];
}

export class CreateCampagneSpecifiqueWithoutRefDto
    extends BaseCampagneDto
    implements CreateCampagneSpecifiqueModelWithoutRef
{
    @IsBoolean()
    @IsNotEmpty()
    generic: false = false;

    @IsString()
    @IsNotEmpty()
    cohortId: string;

    @IsArray()
    @IsNotEmpty()
    programmations: CampagneProgrammation[];
}

export class CreateCampagneSpecifiqueWithRefDto implements CreateCampagneSpecifiqueModelWithRef {
    @IsBoolean()
    @IsNotEmpty()
    generic: false = false;

    @IsString()
    @IsNotEmpty()
    cohortId: string;

    @IsString()
    @IsNotEmpty()
    campagneGeneriqueId: string;

    @IsBoolean()
    @IsNotEmpty()
    isProgrammationActive: boolean = false;
}

export class UpdateCampagneGeneriqueDto
    extends CreateCampagneGeneriqueDto
    implements Omit<CampagneGeneriqueModel, "envois">
{
    @IsString()
    @IsNotEmpty()
    id: string;
}

export class UpdateCampagneSpecifiqueWithoutRefDto extends CreateCampagneSpecifiqueWithoutRefDto {
    @IsString()
    @IsNotEmpty()
    id: string;
}

export class UpdateCampagneSpecifiqueWithRefDto extends CreateCampagneSpecifiqueWithRefDto {
    @IsString()
    @IsNotEmpty()
    id: string;
}

export type CreateCampagneDto =
    | CreateCampagneGeneriqueDto
    | CreateCampagneSpecifiqueWithoutRefDto
    | CreateCampagneSpecifiqueWithRefDto;
export type UpdateCampagneDto =
    | UpdateCampagneGeneriqueDto
    | UpdateCampagneSpecifiqueWithoutRefDto
    | UpdateCampagneSpecifiqueWithRefDto;
