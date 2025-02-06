import { Inject, Injectable } from "@nestjs/common";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { JeuneModel } from "@admin/core/sejours/jeune/Jeune.model";

@Injectable()
export class JeuneGuardService {
    constructor(@Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway) {}
    async findJeune(request: any): Promise<JeuneModel> {
        let jeune = request.jeune;
        if (!jeune) {
            jeune = await this.jeuneGateway.findById(request.params.id);
        }
        if (!jeune) {
            throw new Error("Young not found");
        }
        return jeune;
    }
}
