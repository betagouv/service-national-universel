import { CreateListeDiffusionModel, ListeDiffusionModel } from "@plan-marketing/core/ListeDiffusion.model";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
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

export class UpdateListeDiffusionDto extends CreateListeDiffusionDto implements ListeDiffusionModel {
    @IsString()
    @IsNotEmpty()
    id: string;

    filters: ListeDiffusionFiltres;
}
