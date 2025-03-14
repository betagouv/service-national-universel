import { IsMongoId } from "class-validator";

export class GetDesistementParamsDto {
    @IsMongoId()
    sessionId: string;
}

export class PostSimulationDesistementParamsDto {
    @IsMongoId()
    sessionId: string;
}

export class PostSimulationsDesistementPayloadDto {
    @IsMongoId()
    affectationTaskId: string;
}

export class PostValiderDesistementParamsDto {
    @IsMongoId()
    sessionId: string;

    @IsMongoId()
    taskId: string;
}
