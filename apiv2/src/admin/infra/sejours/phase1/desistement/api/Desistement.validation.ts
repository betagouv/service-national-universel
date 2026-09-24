import { IsMongoId } from "class-validator";

export class GetDesistementParamsDto {
    @IsMongoId()
    sessionId: string;
}
