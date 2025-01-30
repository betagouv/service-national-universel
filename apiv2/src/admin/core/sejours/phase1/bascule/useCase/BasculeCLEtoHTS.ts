import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { JeuneGateway } from "../../../jeune/Jeune.gateway";
import { ChangerLaSessionDuJeunePayloadDto } from "@admin/infra/sejours/phase1/bascule/api/Bascule.validation";
import { JeuneMapper } from "@admin/infra/sejours/jeune/repository/Jeune.mapper";
import { YoungDto } from "snu-lib";
import { ReferentModel } from "@admin/core/iam/Referent.model";

@Injectable()
export class BasculeCLEtoHTS implements UseCase<YoungDto> {
    constructor(@Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway) {}
    async execute(
        jeuneId: string,
        payload: ChangerLaSessionDuJeunePayloadDto,
        user: Partial<ReferentModel>,
    ): Promise<YoungDto> {
        console.log("BasculeCLEtoHTS.execute", payload);
        const jeune = await this.jeuneGateway.findById(jeuneId);
        return JeuneMapper.toDto(jeune);
    }
}
