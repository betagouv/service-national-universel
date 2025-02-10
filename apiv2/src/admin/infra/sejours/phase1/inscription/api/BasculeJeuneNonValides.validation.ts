import { ArrayMinSize, IsArray, IsBoolean, IsIn } from "class-validator";

import { departmentList, GRADES, YOUNG_STATUS } from "snu-lib";

export class PostSimulationsPayloadDto {
    @IsArray()
    @IsIn(Object.values(YOUNG_STATUS), { each: true })
    @ArrayMinSize(1)
    status: Array<keyof typeof YOUNG_STATUS>;

    @IsArray()
    @IsIn(departmentList, { each: true })
    @ArrayMinSize(1)
    departements: string[];

    @IsArray()
    @IsIn(Object.values(GRADES), { each: true })
    @ArrayMinSize(1)
    niveauScolaires: Array<keyof typeof GRADES>;

    @IsBoolean()
    etranger: boolean;

    @IsBoolean()
    avenir: boolean;
}

export class PostSimulationValiderPayloadDto {
    @IsBoolean()
    sendEmail: boolean;
}
