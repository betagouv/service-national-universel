import { Inject, Injectable } from "@nestjs/common";
import { JeuneModel } from "./Jeune.model";
import { JeuneGateway } from "./Jeune.gateway";
import { YOUNG_STATUS } from "snu-lib";

@Injectable()
export class JeuneService {
    constructor(@Inject(JeuneGateway) private readonly classeGateway: JeuneGateway) {}

    findAll(): Promise<JeuneModel[]> {
        return this.classeGateway.findAll();
    }

    groupJeunesByReponseAuxAffectations(jeunes: Partial<JeuneModel>[], sessionId: string) {
        return jeunes.reduce(
            (acc, jeune) => {
                if (jeune.sessionId !== sessionId) {
                    acc.jeunesAutreSession.push(jeune);
                } else if (jeune.statut === YOUNG_STATUS.WITHDRAWN) {
                    acc.jeunesDesistes.push(jeune);
                } else if (jeune.youngPhase1Agreement === "true") {
                    acc.jeunesConfirmes.push(jeune);
                } else if (
                    jeune.statut === YOUNG_STATUS.VALIDATED &&
                    (jeune.youngPhase1Agreement === "false" || !jeune.youngPhase1Agreement)
                ) {
                    acc.jeunesNonConfirmes.push(jeune);
                }
                return acc;
            },
            {
                jeunesAutreSession: [] as Partial<JeuneModel>[],
                jeunesDesistes: [] as Partial<JeuneModel>[],
                jeunesConfirmes: [] as Partial<JeuneModel>[],
                jeunesNonConfirmes: [] as Partial<JeuneModel>[],
            },
        );
    }
}
