import { Inject, Logger } from "@nestjs/common";

import { COHORTS, MIME_TYPES, YOUNG_STATUS } from "snu-lib";

import { UseCase } from "@shared/core/UseCase";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

import { JeuneGateway } from "../../jeune/Jeune.gateway";

import { FileGateway } from "@shared/core/File.gateway";
import {
    SimulationBasculeJeunesValidesTaskParameters,
    JeuneRapport,
    RAPPORT_SHEETS,
    RapportData,
} from "./SimulationBasculeJeunesValidesTask.model";
import { JeuneModel } from "../../jeune/Jeune.model";
import { SessionGateway } from "../session/Session.gateway";
import { InscriptionService } from "./Inscription.service";
import { ClockGateway } from "@shared/core/Clock.gateway";

export type SimulationBasculeJeunesValidesResult = {
    analytics: {
        jeunesAvenir: number;
        jeunesProchainSejour: number;
        jeunesRefuses: number;
    };
    rapportData: RapportData;
    rapportFile: {
        Location: string;
        ETag: string;
        Bucket: string;
        Key: string;
    };
};

export class SimulationBasculeJeunesValides implements UseCase<SimulationBasculeJeunesValidesResult> {
    constructor(
        @Inject(InscriptionService)
        private readonly inscriptionService: InscriptionService,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        private readonly logger: Logger,
    ) {}
    async execute({
        sessionId,
        status,
        statusPhase1,
        presenceArrivee,
        statusPhase1Motif,
        niveauScolaires,
        departements,
        etranger,
        avenir,
    }: SimulationBasculeJeunesValidesTaskParameters): Promise<SimulationBasculeJeunesValidesResult> {
        let jeuneList = await this.jeuneGateway.findBySessionIdStatutsStatutsPhase1NiveauScolairesAndDepartements(
            sessionId,
            status,
            status.includes(YOUNG_STATUS.VALIDATED) ? statusPhase1 : [],
            niveauScolaires,
            departements,
        );
        if (!etranger) {
            jeuneList = jeuneList.filter((jeune) => jeune.paysScolarite === "FRANCE");
        }
        if (status.includes(YOUNG_STATUS.VALIDATED)) {
            if (presenceArrivee) {
                jeuneList = jeuneList.filter((jeune) => jeune.presenceArrivee === "true");
            }
            if (statusPhase1Motif.length) {
                jeuneList = jeuneList.filter(
                    (jeune) => jeune.departSejourMotif && statusPhase1Motif.includes(jeune.departSejourMotif),
                );
            }
        }
        if (jeuneList.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_ENOUGH_DATA, "Aucun jeune !");
        }

        this.logger.log(`Jeunes a basculer : ${jeuneList.length}`);

        const rapportData: RapportData = {
            jeunesAvenir: [],
            jeunesProchainSejour: [],
            jeunesRefuses: [],
        };

        if (avenir) {
            const sessionAVenir = await this.sessionGateway.findByName(COHORTS.AVENIR);
            if (!sessionAVenir) {
                throw new FunctionalException(
                    FunctionalExceptionCode.NOT_ENOUGH_DATA,
                    `Session ${COHORTS.AVENIR} introuvable`,
                );
            }
            for (const jeune of jeuneList) {
                rapportData.jeunesAvenir.push(
                    this.mapJeuneRapport(jeune, {
                        ancienneSession: jeune.sessionNom,
                        nouvelleSession: sessionAVenir.nom,
                        ancienneSessionId: jeune.sessionId,
                        nouvelleSessionId: sessionAVenir.id,
                    }),
                );
            }
        } else {
            // prochaine sejour eligible
            for (const jeune of jeuneList) {
                const sessions = await this.inscriptionService.getSessionsEligible(jeune);
                if (sessions.length > 0) {
                    // au moins une session est disponible
                    rapportData.jeunesProchainSejour.push(
                        this.mapJeuneRapport(jeune, {
                            ancienneSession: jeune.sessionNom,
                            nouvelleSession: sessions[0].nom,
                            ancienneSessionId: jeune.sessionId,
                            nouvelleSessionId: sessions[0].id,
                        }),
                    );
                } else {
                    // aucune session n'est disponible pour ce jeune
                    rapportData.jeunesRefuses.push(
                        this.mapJeuneRapport(
                            {
                                ...jeune,
                                statut: YOUNG_STATUS.REFUSED,
                            },
                            {
                                ancienneSession: jeune.sessionNom,
                            },
                        ),
                    );
                }
            }
        }

        const countBySession = rapportData.jeunesProchainSejour.reduce((acc, jeune) => {
            if (!acc[jeune.nouvelleSession!]) {
                acc[jeune.nouvelleSession!] = 0;
            }
            acc[jeune.nouvelleSession!] += 1;
            return acc;
        }, {});

        // Calcul des données pour le rapport excel
        const fileBuffer = await this.fileGateway.generateExcel({
            [RAPPORT_SHEETS.RESUME]: [
                ...Object.keys(countBySession).map((key) => `${key} : ${countBySession[key]}`),
                `Séjour à venir : ${rapportData.jeunesAvenir.length}`,
                `Refusés : ${rapportData.jeunesRefuses.length}`,
            ].map((ligne) => ({
                "": ligne,
            })),
            [RAPPORT_SHEETS.PROCHAINSEJOUR]: rapportData.jeunesProchainSejour,
            [RAPPORT_SHEETS.AVENIR]: rapportData.jeunesAvenir,
            [RAPPORT_SHEETS.REFUSES]: rapportData.jeunesRefuses,
        });

        const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
        const fileName = `simulation-bascule-jeunes-valides/bascule-jeunes-valides_simulation_${sessionId}_${timestamp}.xlsx`;
        const rapportFile = await this.fileGateway.uploadFile(
            `file/admin/sejours/phase1/inscription/simulation/${sessionId}/${fileName}`,
            {
                data: fileBuffer,
                mimetype: MIME_TYPES.EXCEL,
            },
        );

        return {
            analytics: {
                jeunesAvenir: rapportData.jeunesAvenir.length,
                jeunesProchainSejour: rapportData.jeunesProchainSejour.length,
                jeunesRefuses: rapportData.jeunesRefuses.length,
            },
            rapportData,
            rapportFile,
        };
    }

    mapJeuneRapport(jeune: JeuneModel, complement: Partial<JeuneRapport> = {}): JeuneRapport {
        return {
            id: jeune.id,
            prenom: jeune.prenom,
            nom: jeune.nom?.toUpperCase(),
            dateNaissance: jeune.dateNaissance ? this.clockGateway.formatShort(jeune.dateNaissance) : "",
            age: jeune.dateNaissance ? this.clockGateway.computeAge(jeune.dateNaissance) : "",
            regionResidence: jeune.region,
            departementResidence: jeune.departement,
            regionScolarite: jeune.regionScolarite,
            departementScolarite: jeune.departementScolarite,
            paysScolarite: jeune.paysScolarite,
            statut: jeune.statut,
            statutPhase1: jeune.statutPhase1,
            presenceArrivee: jeune.presenceArrivee,
            departSejourMotif: jeune.departSejourMotif,
            ...complement,
        };
    }
}
