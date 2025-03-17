import { Inject, Injectable } from "@nestjs/common";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { TaskStatus, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { FileGateway } from "@shared/core/File.gateway";
import { ValiderAffectationRapportData } from "../affectation/ValiderAffectationHTS";
import { JeuneModel } from "../../jeune/Jeune.model";
import { Transactional } from "@nestjs-cls/transactional";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { EmailTemplate, EmailWithMessage } from "@notification/core/Notification";
import { AffectationService } from "../affectation/Affectation.service";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import {
    JeuneSimulationDesistementRapport,
    JeuneTraitementDesistementRapport,
    RAPPORT_SHEETS_SIMULATION,
    RAPPORT_SHEETS_TRAITEMENT,
    RapportData,
} from "./SimulationDesisterPostAffectationTask.model";

export type StatusDesistement = {
    status: TaskStatus | "NONE";
    lastCompletedAt: Date;
};

@Injectable()
export class DesistementService {
    constructor(
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
        @Inject(LigneDeBusGateway) private readonly ligneDeBusGateway: LigneDeBusGateway,
        @Inject(SejourGateway) private readonly sejourGateway: SejourGateway,
        private readonly affectationService: AffectationService,
    ) {}

    groupJeunesByReponseAuxAffectations(jeunes: JeuneModel[], sessionId: string) {
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
                jeunesAutreSession: [] as JeuneModel[],
                jeunesDesistes: [] as JeuneModel[],
                jeunesConfirmes: [] as JeuneModel[],
                jeunesNonConfirmes: [] as JeuneModel[],
            },
        );
    }

    async getJeunesIdsFromRapportKey(key: string): Promise<string[]> {
        const affectationFile = await this.fileGateway.downloadFile(key);
        if (!affectationFile) throw new Error(`Rapport file not found: ${key}`);

        const parsedAffectationFile = await this.fileGateway.parseXLS<ValiderAffectationRapportData[0]>(
            affectationFile.Body,
        );
        return parsedAffectationFile.map((row) => row.id);
    }

    @Transactional()
    async desisterJeunes(jeunes: JeuneModel[], sessionId: string): Promise<number> {
        const jeunesList: JeuneModel[] = [];
        for (const jeune of jeunes) {
            jeunesList.push({
                ...jeune,
                statut: YOUNG_STATUS.WITHDRAWN,
                statutPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
                desistementMotif: "Non confirmation de la participation au séjour",
            });
        }

        const res = await this.jeuneGateway.bulkUpdate(jeunesList);

        const lignesDeBusIds = [
            ...new Set(jeunes.map((jeune) => jeune.ligneDeBusId).filter((id): id is string => !!id)),
        ];
        if (lignesDeBusIds.length > 0) {
            const lignesDeBus = await this.ligneDeBusGateway.findByIds(lignesDeBusIds);
            await this.affectationService.syncPlacesDisponiblesLignesDeBus(lignesDeBus);
        }

        const sejours = await this.sejourGateway.findBySessionId(sessionId);
        await this.affectationService.syncPlacesDisponiblesSejours(sejours);

        return res;
    }

    async notifierJeunes(jeunes: JeuneModel[]) {
        const templateId = EmailTemplate.DESISTEMENT_PAR_TIERS;
        const message = "Non confirmation de la participation au séjour";
        for await (const jeune of jeunes) {
            // jeune
            await this.notificationGateway.sendEmail<EmailWithMessage>(
                {
                    to: [{ email: jeune.email, name: `${jeune.prenom} ${jeune.nom}` }],
                    message,
                },
                templateId,
            );
            // RL 1
            if (jeune.parent1Email) {
                await this.notificationGateway.sendEmail<EmailWithMessage>(
                    {
                        to: [{ email: jeune.parent1Email, name: `${jeune.prenom} ${jeune.nom}` }],
                        message,
                    },
                    templateId,
                );
            }
            // RL 2
            if (jeune.parent2Email) {
                await this.notificationGateway.sendEmail<EmailWithMessage>(
                    {
                        to: [{ email: jeune.parent2Email, name: `${jeune.prenom} ${jeune.nom}` }],
                        message,
                    },
                    templateId,
                );
            }
        }
    }

    mapJeunesSimulation(jeunes: JeuneModel[]): JeuneSimulationDesistementRapport[] {
        return jeunes.map((jeune) => ({
            id: jeune.id,
            email: jeune.email,
            prenom: jeune.prenom,
            nom: jeune.nom,
            statut: jeune.statut,
            statutPhase1: jeune.statutPhase1,
            sejour: jeune.sessionNom,
            region: jeune.region,
            departement: jeune.departement,
            sessionId: jeune.sessionId,
            youngPhase1Agreement: jeune.youngPhase1Agreement,
        }));
    }

    mapJeunesTraitement(jeunes: JeuneModel[]): JeuneTraitementDesistementRapport[] {
        return jeunes.map((jeune) => ({
            sejour: jeune.sessionNom,
            id: jeune.id,
            prenom: jeune.prenom,
            nom: jeune.nom,
            email: jeune.email,
            sexe: jeune.genre,
            departement: jeune.departement,
            region: jeune.region,
            statut: jeune.statut,
            statutPhase1: jeune.statutPhase1,
            sessionId: jeune.sessionId,
            "centre d'affectation": jeune.centreId,
            "PDR d'affectation": jeune.pointDeRassemblementId,
            Ligne: jeune.ligneDeBusId,
            "RL1 Nom": jeune.parent1Nom,
            "RL1 Prénom": jeune.parent1Prenom,
            "RL1 Email": jeune.parent1Email,
            "RL2 Nom": jeune.parent2Nom || "",
            "RL2 Prénom": jeune.parent2Prenom || "",
            "RL2 Email": jeune.parent2Email || "",
            youngPhase1Agreement: jeune.youngPhase1Agreement,
        }));
    }

    async generateRapportSimulationPostDesistement(rapportData: RapportData): Promise<Buffer> {
        const fileBuffer = await this.fileGateway.generateExcel({
            [RAPPORT_SHEETS_SIMULATION.RESUME]: [
                {
                    Groupe: "Total de volontaires affectés",
                    Total:
                        rapportData.jeunesDesistes.length +
                        rapportData.jeunesAutreSession.length +
                        rapportData.jeunesConfirmes.length +
                        rapportData.jeunesNonConfirmes.length,
                },
                {
                    Groupe: "Volontaires désistés au préalable",
                    Total: rapportData.jeunesDesistes.length,
                },
                {
                    Groupe: "Volontaires ayant changé de séjour",
                    Total: rapportData.jeunesAutreSession.length,
                },
                {
                    Groupe: "Volontaires ayant confirmés leur séjour",
                    Total: rapportData.jeunesConfirmes.length,
                },
                {
                    Groupe: "Volontaires désistés par ce traitement",
                    Total: rapportData.jeunesNonConfirmes.length,
                },
            ],
            [RAPPORT_SHEETS_SIMULATION.A_DESITER]: rapportData.jeunesNonConfirmes,
            [RAPPORT_SHEETS_SIMULATION.CONFIRMATION_PARTICIPATION]: rapportData.jeunesConfirmes,
            [RAPPORT_SHEETS_SIMULATION.CHANGEMENTS_SEJOUR]: rapportData.jeunesAutreSession,
            [RAPPORT_SHEETS_SIMULATION.DESITEMENT_PREALABLE]: rapportData.jeunesDesistes,
        });
        return fileBuffer;
    }

    async generateRapportTraitementPostDesistement(rapportData: RapportData): Promise<Buffer> {
        const fileBuffer = await this.fileGateway.generateExcel({
            [RAPPORT_SHEETS_TRAITEMENT.RESUME]: [
                {
                    Groupe: "Total de volontaires affectés",
                    Total:
                        rapportData.jeunesDesistes.length +
                        rapportData.jeunesAutreSession.length +
                        rapportData.jeunesConfirmes.length +
                        rapportData.jeunesNonConfirmes.length,
                },
                {
                    Groupe: "Volontaires désistés au préalable",
                    Total: rapportData.jeunesDesistes.length,
                },
                {
                    Groupe: "Volontaires ayant changé de séjour",
                    Total: rapportData.jeunesAutreSession.length,
                },
                {
                    Groupe: "Volontaires ayant confirmés leur séjour",
                    Total: rapportData.jeunesConfirmes.length,
                },
                {
                    Groupe: "Volontaires désistés par ce traitement",
                    Total: rapportData.jeunesNonConfirmes.length,
                },
            ],
            [RAPPORT_SHEETS_TRAITEMENT.A_DESITER]: rapportData.jeunesNonConfirmes,
            [RAPPORT_SHEETS_TRAITEMENT.CONFIRMATION_PARTICIPATION]: rapportData.jeunesConfirmes,
            [RAPPORT_SHEETS_TRAITEMENT.CHANGEMENTS_SEJOUR]: rapportData.jeunesAutreSession,
            [RAPPORT_SHEETS_TRAITEMENT.DESITEMENT_PREALABLE]: rapportData.jeunesDesistes,
        });
        return fileBuffer;
    }
}
