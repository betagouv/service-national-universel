import { Inject, Injectable } from "@nestjs/common";
import { CreateJeuneModel, JeuneModel } from "./Jeune.model";
import { JeuneGateway } from "./Jeune.gateway";
import { YOUNG_SOURCE } from "snu-lib";
import { ClasseService } from "../cle/classe/Classe.service";

@Injectable()
export class JeuneService {
    constructor(
        @Inject(JeuneGateway)
        private readonly jeuneGateway: JeuneGateway,
        private readonly classeService: ClasseService,
    ) {}

    async create(jeune: CreateJeuneModel): Promise<JeuneModel> {
        const jeuneCreated = await this.jeuneGateway.create(jeune);

        // On met à jour l'effectif de la classe
        if (jeuneCreated.source === YOUNG_SOURCE.CLE) {
            await this.classeService.updatePlacesPrises(jeuneCreated.classeId);
        }
        return jeuneCreated;
    }

    async update(jeune: JeuneModel): Promise<JeuneModel> {
        const jeuneUpdated = await this.jeuneGateway.update(jeune);

        // On met à jour l'effectif de la classe
        if (jeuneUpdated.source === YOUNG_SOURCE.CLE) {
            await this.classeService.updatePlacesPrises(jeuneUpdated.classeId);
        }
        return jeuneUpdated;
    }
}
