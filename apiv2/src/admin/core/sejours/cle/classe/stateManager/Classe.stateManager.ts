import { Inject, Injectable } from "@nestjs/common";
import { ClasseModel } from "../Classe.model";
import { ClasseGateway } from "../Classe.gateway";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { SessionGateway } from "@admin/core/sejours/phase1/session/Session.gateway";
import { STATUS_CLASSE, YOUNG_STATUS } from "snu-lib";
import { SessionService } from "@admin/core/sejours/phase1/session/Session.service";

@Injectable()
export class ClasseStateManager {
    constructor(
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
    ) {}

    async compute(classeId: string): Promise<ClasseModel> {
        // Get classe
        let classe = await this.classeGateway.findById(classeId);
        if (!classe.sessionId) throw new Error("Classe has no session");
        if (classe.statut === STATUS_CLASSE.WITHDRAWN) return classe;

        // Get session
        const classeSession = await this.sessionGateway.findById(classe.sessionId);

        // Get jeunes
        const jeunes = await this.jeuneGateway.findByClasseId(classe.id);
        const jeunesValidés = jeunes.filter((jeune) => jeune.statut === YOUNG_STATUS.VALIDATED);
        const placesPrises = jeunesValidés.length;
        classe.placesPrises = placesPrises;

        // Get inscription date
        const isInscriptionOpen = SessionService.isCohortInscriptionOpen(classeSession);
        const isInscriptionClosed = !isInscriptionOpen;

        // Open
        if (
            [STATUS_CLASSE.ASSIGNED, STATUS_CLASSE.CLOSED].includes(classe.statut as any) &&
            isInscriptionOpen &&
            placesPrises < classe.placesTotal
        ) {
            classe.statut = STATUS_CLASSE.OPEN;
            await this.classeGateway.update(classe);
            return classe;
        }

        // Closed
        if ((classe.statut !== STATUS_CLASSE.CLOSED && isInscriptionClosed) || classe.placesTotal <= placesPrises) {
            classe.statut = STATUS_CLASSE.CLOSED;
            await this.classeGateway.update(classe);
            return classe;
        }

        await this.classeGateway.update(classe);

        return classe;
    }
}
