import { CreateListeDiffusionModel, ListeDiffusionModel } from "@plan-marketing/core/ListeDiffusion.model";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ListeDiffusionEnum } from "snu-lib";

export class CreateListeDiffusionDto implements CreateListeDiffusionModel {
    @IsString()
    @IsNotEmpty()
    nom: string;

    @IsEnum(ListeDiffusionEnum)
    @IsNotEmpty()
    type: ListeDiffusionEnum;
}

export class UpdateListeDiffusionDto extends CreateListeDiffusionDto implements ListeDiffusionModel {
    @IsString()
    @IsNotEmpty()
    id: string;
}

