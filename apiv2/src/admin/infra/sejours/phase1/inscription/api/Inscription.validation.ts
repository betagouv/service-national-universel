import { ArrayMinSize, IsArray, IsBoolean, IsIn, IsMongoId } from "class-validator";

import {
    DEPART_SEJOUR_MOTIFS,
    GRADES,
    region2department,
    RegionsMetropole,
    YOUNG_STATUS,
    YOUNG_STATUS_PHASE1,
} from "snu-lib";

export class PostSimulationsPayloadDto {
    @IsArray()
    @IsIn(Object.values(YOUNG_STATUS), { each: true })
    @ArrayMinSize(1)
    status: Array<keyof typeof YOUNG_STATUS>;

    @IsArray()
    @IsIn(Object.values(YOUNG_STATUS_PHASE1), { each: true })
    @ArrayMinSize(1)
    statusPhase1: Array<keyof typeof YOUNG_STATUS>;

    @IsBoolean()
    cohesionStayPresence;

    @IsArray()
    @IsIn(Object.values(DEPART_SEJOUR_MOTIFS), { each: true })
    statusPhase1Motif: Array<keyof typeof DEPART_SEJOUR_MOTIFS>;

    @IsArray()
    @IsIn(RegionsMetropole.flatMap((region) => region2department[region]), { each: true })
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

export class PostSimulationValiderPayloadDto {}
