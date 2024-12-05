import { ArrayMinSize, IsArray, IsBoolean, IsIn, IsMongoId } from "class-validator";

import { GRADES, region2department, RegionsMetropole } from "snu-lib";

export class PostSimulationsPayloadDto {
    @IsArray()
    @IsIn(RegionsMetropole.flatMap((region) => region2department[region]), { each: true })
    @ArrayMinSize(1)
    departements: string[];

    @IsArray()
    @IsIn(Object.values(GRADES), { each: true })
    @ArrayMinSize(1)
    niveauScolaires: Array<keyof typeof GRADES>;

    @IsMongoId()
    sdrImportId: string;

    @IsBoolean()
    etranger: boolean;

    @IsBoolean()
    affecterPDR: boolean;
}
