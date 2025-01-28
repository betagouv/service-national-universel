import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { JeuneGateway } from "../../Jeune.gateway";
import { JeuneModel } from "../../Jeune.model";
import { ChangerLaCohorteDuJeunePayloadDto } from "@admin/infra/sejours/jeune/api/Jeune.validation";

@Injectable()
export class BasculeCLEtoCLE implements UseCase<JeuneModel> {
    constructor(@Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway) {}
    async execute(jeuneId: string, payload: ChangerLaCohorteDuJeunePayloadDto): Promise<JeuneModel> {
        console.log("BasculeCLEtoCLE.execute", payload);
        const jeune = await this.jeuneGateway.findById(jeuneId);
        return jeune;
    }
}
