import { IsMongoId } from "class-validator";

export class PostSimulationsDesistementPayloadDto {
    @IsMongoId()
    affectationTaskId: string;
}
