import { CreateListeDiffusionModel, ListeDiffusionModel } from "@plan-marketing/core/ListeDiffusion.model";
import { IsEmpty, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ListeDiffusionEnum, ListeDiffusionFiltres } from "snu-lib";

export class CreateListeDiffusionDto implements CreateListeDiffusionModel {
    @IsString()
    @IsNotEmpty()
    nom: string;

    @IsEnum(ListeDiffusionEnum)
    @IsNotEmpty()
    type: ListeDiffusionEnum;

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

    filters: ListeDiffusionFiltres;
}
