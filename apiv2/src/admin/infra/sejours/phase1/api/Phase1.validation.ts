import { IsMongoId } from "class-validator";

export class DeleteLigneDeBusParamsDto {
    @IsMongoId()
    sessionId: string;

    @IsMongoId()
    ligneId: string;
}
