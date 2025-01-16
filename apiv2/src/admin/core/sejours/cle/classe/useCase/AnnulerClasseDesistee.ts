import { HistoryType } from "@admin/core/history/History";
import { HistoryGateway } from "@admin/core/history/History.gateway";
import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { ClasseModel } from "@admin/core/sejours/cle/classe/Classe.model";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { STATUS_CLASSE, YOUNG_STATUS } from "snu-lib";

Injectable();
export class AnnulerClasseDesistee implements UseCase<ClasseModel> {
    constructor(
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(HistoryGateway) private readonly historyGateway: HistoryGateway,

        private readonly logger: Logger,
    ) {}
    async execute(classe: ClasseModel): Promise<ClasseModel> {
        this.logger.log(`Annulation du désistement pour la classe : ${classe.id}`, AnnulerClasseDesistee.name);
        // Précédent statut de la classe
        const classeHistory = await this.historyGateway.findLastByReferenceIdAndPath(
            HistoryType.CLASSE,
            classe.id,
            "/status",
        );
        if (!classeHistory) {
            this.logger.log(`Aucun historique trouvé pour la classe : ${classe.id}`, AnnulerClasseDesistee.name);
        }
        const previousStatut = classeHistory?.ops.find((op) => op.path === "/status")
            ?.value as keyof typeof STATUS_CLASSE;
        if (
            !previousStatut ||
            !STATUS_CLASSE.hasOwnProperty(previousStatut) ||
            previousStatut === STATUS_CLASSE.WITHDRAWN
        ) {
            this.logger.log(
                `Statut précédent incohérent ou non trouvé pour la classe : ${classe.id}, statut précédent : ${previousStatut}`,
                AnnulerClasseDesistee.name,
            );
        }
        // Passer la classe à son précédent statut
        const updatedClasse = await this.classeGateway.update({
            ...classe,
            statut: previousStatut || STATUS_CLASSE.CLOSED,
        });

        // Récupérer les jeunes de la classe
        const jeunes = await this.jeuneGateway.findByClasseId(classe.id);
        for (const jeune of jeunes) {
            // // Récupérer le statut de chaque jeune
            const jeuneHistory = await this.historyGateway.findLastByReferenceIdAndPath(
                HistoryType.JEUNE,
                jeune.id,
                "/status",
            );
            if (!jeuneHistory) {
                this.logger.log(`Aucun historique trouvé pour le jeune : ${jeune.id}`, AnnulerClasseDesistee.name);
            }
            const previousStatut = jeuneHistory?.ops.find((op) => op.path === "/status")?.value;
            if (
                !previousStatut ||
                !YOUNG_STATUS.hasOwnProperty(previousStatut) ||
                previousStatut === YOUNG_STATUS.ABANDONED
            ) {
                this.logger.log(
                    `Statut précédent incohérent ou non trouvé pour le jeune : ${jeune.id}, statut précédent : ${previousStatut}`,
                    AnnulerClasseDesistee.name,
                );
            }
            // Passer le jeune à son précédent statut
            await this.jeuneGateway.update({
                ...jeune,
                statut: previousStatut || YOUNG_STATUS.VALIDATED,
            });
        }

        return updatedClasse;
    }
}
