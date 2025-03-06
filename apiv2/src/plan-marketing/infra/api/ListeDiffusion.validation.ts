import { CreateListeDiffusionModel, ListeDiffusionModel } from "@plan-marketing/core/ListeDiffusion.model";
import { IsEmpty, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
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

export class UpdateListeDiffusionDto implements Partial<ListeDiffusionModel> {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    nom: string;

    @IsOptional()
    @IsEnum(ListeDiffusionEnum)
    type?: ListeDiffusionEnum;

    @IsObject()
    @IsNotEmpty()
    filters: ListeDiffusionFiltres;
}
