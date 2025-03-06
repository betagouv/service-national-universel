import { CreateListeDiffusionModel, UpdateListeDiffusionModel } from "@plan-marketing/core/ListeDiffusion.model";
import { IsEnum, IsNotEmpty, IsObject, IsString } from "class-validator";
import { ListeDiffusionEnum, ListeDiffusionFiltres } from "snu-lib";

export class CreateListeDiffusionDto implements CreateListeDiffusionModel {
    @IsString()
    @IsNotEmpty()
    nom: string;

    @IsEnum(ListeDiffusionEnum)
    @IsNotEmpty()
    type: ListeDiffusionEnum;

    @IsObject()
    @IsNotEmpty()
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
    filters: ListeDiffusionFiltres;
}
