import { Inject, Logger } from "@nestjs/common";

import { COHORTS, MIME_TYPES, YOUNG_STATUS } from "snu-lib";

import { UseCase } from "@shared/core/UseCase";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

import { JeuneGateway } from "../../jeune/Jeune.gateway";

import { FileGateway } from "@shared/core/File.gateway";
import {
    SimulationBasculeJeunesTaskParameters,
    RAPPORT_SHEETS,
    RapportData,
    JeuneRapportSimulation,
} from "./SimulationBasculeJeunesTask.model";
import { JeuneModel } from "../../jeune/Jeune.model";
import { SessionGateway } from "../session/Session.gateway";
import { InscriptionService } from "./Inscription.service";
import { ClockGateway } from "@shared/core/Clock.gateway";

type TypeBascule = "bascule-jeunes-valides" | "bascule-jeunes-non-valides";

export type SimulationBasculeJeunesResult = {
    analytics: {
        jeunesAvenir: number;
        jeunesProchainSejour: number;
    };
    rapportData: RapportData;
    rapportFile: {
        Location: string;
        ETag: string;
        Bucket: string;
        Key: string;
    };
};

export class SimulationBasculeJeunes implements UseCase<SimulationBasculeJeunesResult> {
    constructor(
        @Inject(InscriptionService)
        private readonly inscriptionService: InscriptionService,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        private readonly logger: Logger,
    ) {}
    async execute(
        {
            sessionId,
            status,
            statusPhase1,
            presenceArrivee,
            statusPhase1Motif,
            niveauScolaires,
            departements,
            etranger,
            sansDepartement,
            avenir,
        }: SimulationBasculeJeunesTaskParameters,
        type: TypeBascule,
    ): Promise<SimulationBasculeJeunesResult> {
        let jeuneList = await this.jeuneGateway.findBySessionIdStatutsStatutsPhase1NiveauScolairesAndDepartements(
            sessionId,
            status,
            status.includes(YOUNG_STATUS.VALIDATED) ? statusPhase1 : [],
            niveauScolaires,
            sansDepartement ? [...departements, null] : departements,
        );
        this.logger.log(`Jeunes a basculer (avant filtre simulation) : ${jeuneList.length}`);
        if (!etranger) {
            jeuneList = jeuneList.filter((jeune) => jeune.paysScolarite?.toUpperCase() === "FRANCE");
        }
        if (status.includes(YOUNG_STATUS.VALIDATED)) {
            if (presenceArrivee.length) {
                jeuneList = jeuneList.filter((jeune) => this.filterPresenceJeune(jeune, presenceArrivee));
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

        this.logger.log(`Jeunes a basculer (simulation ${type}) : ${jeuneList.length}`);

        const rapportData: RapportData = {
            jeunesAvenir: [],
            jeunesProchainSejour: [],
        };
        const sessionAVenir = await this.sessionGateway.findByName(COHORTS.AVENIR);
        if (!sessionAVenir) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                `Session ${COHORTS.AVENIR} introuvable`,
            );
        }
        if (avenir) {
            for (const jeune of jeuneList) {
                rapportData.jeunesAvenir.push(
                    this.mapJeuneRapport(
                        jeune,
                        {
                            ancienneSession: jeune.sessionNom,
                            nouvelleSession: sessionAVenir.nom,
                            ancienneSessionId: jeune.sessionId,
                            nouvelleSessionId: sessionAVenir.id,
                        },
                        type,
                    ),
                );
            }
        } else {
            // prochaine sejour eligible
            for (const jeune of jeuneList) {
                const sessions = await this.inscriptionService.getSessionsEligible(jeune);
                if (sessions.length > 0) {
                    // au moins une session est disponible
                    rapportData.jeunesProchainSejour.push(
                        this.mapJeuneRapport(
                            jeune,
                            {
                                ancienneSession: jeune.sessionNom,
                                nouvelleSession: sessions[0].nom,
                                ancienneSessionId: jeune.sessionId,
                                nouvelleSessionId: sessions[0].id,
                            },
                            type,
                        ),
                    );
                } else {
                    // aucune session n'est disponible pour ce jeune (=> avenir)
                    rapportData.jeunesAvenir.push(
                        this.mapJeuneRapport(
                            jeune,
                            {
                                ancienneSession: jeune.sessionNom,
                                nouvelleSession: sessionAVenir.nom,
                                ancienneSessionId: jeune.sessionId,
                                nouvelleSessionId: sessionAVenir.id,
                            },
                            type,
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

        this.logger.log(
            `Fin simulation bascule (${type}): a venir ${rapportData.jeunesAvenir.length} / elligible ${JSON.stringify(
                countBySession,
                null,
                2,
            )}`,
        );

        // Calcul des données pour le rapport excel
        const fileBuffer = await this.fileGateway.generateExcel({
            [RAPPORT_SHEETS.RESUME]: [
                ...Object.keys(countBySession).map((key) => `${key} : ${countBySession[key]}`),
                `Séjour à venir : ${rapportData.jeunesAvenir.length}`,
            ].map((ligne) => ({
                "": ligne,
            })),
            [RAPPORT_SHEETS.PROCHAINSEJOUR]: rapportData.jeunesProchainSejour,
            [RAPPORT_SHEETS.AVENIR]: rapportData.jeunesAvenir,
        });

        const timestamp = this.clockGateway.formatSafeIsoDate(this.clockGateway.now());
        const fileName = `simulation-${type}/${type}_simulation_${sessionId}_${timestamp}.xlsx`;
        const rapportFile = await this.fileGateway.uploadFile(
            `file/admin/sejours/phase1/inscription/${sessionId}/${fileName}`,
            {
                data: fileBuffer,
                mimetype: MIME_TYPES.EXCEL,
            },
        );

        return {
            analytics: {
                jeunesAvenir: rapportData.jeunesAvenir.length,
                jeunesProchainSejour: rapportData.jeunesProchainSejour.length,
            },
            rapportData,
            rapportFile,
        };
    }

    mapJeuneRapport(
        jeune: JeuneModel,
        complement: Partial<JeuneRapportSimulation> = {},
        type: TypeBascule,
    ): JeuneRapportSimulation {
        return {
            id: jeune.id,
            prenom: jeune.prenom,
            nom: jeune.nom?.toUpperCase(),
            dateNaissance: jeune.dateNaissance ? this.clockGateway.formatShort(jeune.dateNaissance) : "",
            age: jeune.dateNaissance ? this.clockGateway.computeAge(jeune.dateNaissance) : "",
            niveauScolaire: jeune.niveauScolaire,
            regionResidence: jeune.region,
            departementResidence: jeune.departement,
            regionScolarite: jeune.regionScolarite,
            departementScolarite: jeune.departementScolarite,
            paysScolarite: jeune.paysScolarite,
            statut: jeune.statut,
            statutPhase1: jeune.statutPhase1,
            ...(type === "bascule-jeunes-valides"
                ? {
                      presenceArrivee: jeune.presenceArrivee,
                      departSejourMotif: jeune.departSejourMotif,
                  }
                : {
                      classeId: jeune.classeId,
                  }),
            ...complement,
        };
    }

    filterPresenceJeune(jeune: JeuneModel, presenceArrivee: Array<boolean | null>): boolean {
        if (jeune.presenceArrivee === "true" && presenceArrivee.includes(true)) {
            return true;
        } else if (jeune.presenceArrivee === "false" && presenceArrivee.includes(false)) {
            return true;
        } else if (jeune.presenceArrivee === undefined && presenceArrivee.includes(null)) {
            return true;
        }
        return false;
    }
}
