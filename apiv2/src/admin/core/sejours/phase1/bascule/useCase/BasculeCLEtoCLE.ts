import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { JeuneGateway } from "../../../jeune/Jeune.gateway";
import { JeuneModel } from "../../../jeune/Jeune.model";
import { ChangerLaSessionDuJeunePayloadDto } from "@admin/infra/sejours/phase1/bascule/api/Bascule.validation";
import { JeuneMapper } from "@admin/infra/sejours/jeune/repository/Jeune.mapper";
import { YoungDto } from "snu-lib";

@Injectable()
export class BasculeCLEtoCLE implements UseCase<YoungDto> {
    constructor(@Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway) {}
    async execute(jeuneId: string, payload: ChangerLaSessionDuJeunePayloadDto): Promise<YoungDto> {
        console.log("BasculeCLEtoCLE.execute", payload);
        const jeune = await this.jeuneGateway.findById(jeuneId);
        return JeuneMapper.toDto(jeune);
    }
}
