import { HistoryType } from "@admin/core/history/History";
import { HistoryGateway } from "@admin/core/history/History.gateway";
import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { AnnulerClasseDesisteeModel, ClasseModel } from "@admin/core/sejours/cle/classe/Classe.model";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { STATUS_CLASSE, YOUNG_STATUS } from "snu-lib";

@Injectable()
export class AnnulerClasseDesistee implements UseCase<AnnulerClasseDesisteeModel> {
    constructor(
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(HistoryGateway) private readonly historyGateway: HistoryGateway,

        private readonly logger: Logger,
    ) {}
    async execute(classe: ClasseModel): Promise<AnnulerClasseDesisteeModel> {
        let rapport: string[] = [];
        this.logger.log(`Annulation du désistement pour la classe : ${classe.id}`, AnnulerClasseDesistee.name);
        // Précédent statut de la classe
        const classeHistory = await this.historyGateway.findLastByReferenceIdAndPath(
            HistoryType.CLASSE,
            classe.id,
            "/status",
        );
        if (!classeHistory) {
            this.logger.warn(`Aucun historique trouvé pour la classe : ${classe.id}`, AnnulerClasseDesistee.name);
        }
        const previousStatut = classeHistory?.ops.find((op) => op.path === "/status")?.value;
        let nextStatut = previousStatut as keyof typeof STATUS_CLASSE;
        if (
            !previousStatut ||
            !STATUS_CLASSE.hasOwnProperty(previousStatut) ||
            previousStatut === STATUS_CLASSE.WITHDRAWN
        ) {
            this.logger.warn(
                `Statut précédent incohérent ou non trouvé pour la classe : ${classe.id}, statut précédent : ${previousStatut}`,
                AnnulerClasseDesistee.name,
            );
            nextStatut = STATUS_CLASSE.CLOSED;
            rapport.push(`Classe ${classe.id} : Statut précédent : ${previousStatut}`);
        }
        // Passer la classe à son précédent statut
        const updatedClasse = await this.classeGateway.update({
            ...classe,
            statut: nextStatut,
        });

        // Récupérer les jeunes de la classe
        // Filtrer les jeunes qui ont le même cohortId que la classe
        const jeunes = await this.jeuneGateway.findByClasseIdAndSessionId(classe.id, classe.sessionId!);
        for (const jeune of jeunes) {
            // // Récupérer le statut de chaque jeune
            const jeuneHistory = await this.historyGateway.findByReferenceIdAndPathAndValue(
                HistoryType.JEUNE,
                jeune.id,
                "/status",
                YOUNG_STATUS.WITHDRAWN,
            );
            if (!jeuneHistory) {
                this.logger.warn(`Aucun historique trouvé pour le jeune : ${jeune.id}`, AnnulerClasseDesistee.name);
            }
            const previousStatut = jeuneHistory?.ops.find((op) => op.path === "/status")?.originalValue;
            let nextStatut = previousStatut as string;

            if (!previousStatut || !YOUNG_STATUS.hasOwnProperty(previousStatut)) {
                this.logger.warn(
                    `Statut précédent incohérent ou non trouvé pour le jeune : ${jeune.id}, statut précédent : ${previousStatut}`,
                    AnnulerClasseDesistee.name,
                );
                nextStatut = YOUNG_STATUS.WAITING_VALIDATION;
                rapport.push(`Jeune ${jeune.id} : Statut précédent : ${previousStatut}`);
            }
            // Passer le jeune à son précédent statut
            await this.jeuneGateway.update({
                ...jeune,
                statut: nextStatut,
                lastStatusAt: new Date(),
            });
        }

        return {
            classe: updatedClasse,
            rapport: rapport.join(" / "),
        };
    }
}
