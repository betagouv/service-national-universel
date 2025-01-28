import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { JeuneGateway } from "../../../jeune/Jeune.gateway";
import { JeuneModel } from "../../../jeune/Jeune.model";
import { ChangerLaSessionDuJeunePayloadDto } from "@admin/infra/sejours/phase1/bascule/api/Bascule.validation";
import { JeuneMapper } from "@admin/core/sejours/jeune/Jeune.mapper";

@Injectable()
export class BasculeHTStoHTS implements UseCase<JeuneModel> {
    constructor(@Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway) {}
    async execute(jeuneId: string, payload: ChangerLaSessionDuJeunePayloadDto): Promise<JeuneModel> {
        console.log("BasculeHTStoHTS.execute", payload);
        const jeune = await this.jeuneGateway.findById(jeuneId);
        return JeuneMapper.mapJeuneModelToYoungDto(jeune);
    }
}
