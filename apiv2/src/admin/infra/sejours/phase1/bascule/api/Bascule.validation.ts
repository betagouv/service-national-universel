import { IsNotEmpty, IsString, IsEmail, IsIn, ValidateIf } from "class-validator";
import { YOUNG_SOURCE, YOUNG_SOURCE_LIST } from "snu-lib";

export class ChangerLaSessionDuJeunePayloadDto {
    @IsNotEmpty()
    @IsString()
    @IsIn(YOUNG_SOURCE_LIST)
    source: string;

    @IsNotEmpty()
    @IsString()
    cohortId: string;

    // HTS
    @ValidateIf((dto) => dto.source === YOUNG_SOURCE.VOLONTAIRE)
    @IsNotEmpty()
    @IsString()
    cohortDetailedChangeReason?: string;

    @ValidateIf((dto) => dto.source === YOUNG_SOURCE.VOLONTAIRE)
    @IsNotEmpty()
    @IsString()
    cohortChangeReason?: string;

    // CLE
    @ValidateIf((dto) => dto.source === YOUNG_SOURCE.CLE)
    @IsNotEmpty()
    @IsString()
    etablissementId?: string;

    @ValidateIf((dto) => dto.source === YOUNG_SOURCE.CLE)
    @IsNotEmpty()
    @IsString()
    classeId?: string;
}
