import { Inject, Logger } from "@nestjs/common";

import { COHORTS, RegionsHorsMetropole, YOUNG_STATUS, department2region } from "snu-lib";

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
        // @Inject(SimulationBasculeJeunesValidesService)
        // private readonly simulationAffectationHTSService: SimulationBasculeJeunesValidesService,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        private readonly logger: Logger,
    ) {}
    async execute({
        sessionId,
        status,
        statusPhase1,
        cohesionStayPresence,
        statusPhase1Motif,
        niveauScolaires,
        departements,
        etranger,
        avenir,
    }: SimulationBasculeJeunesValidesTaskParameters): Promise<SimulationBasculeJeunesValidesResult> {
        if (departements.some((departement) => RegionsHorsMetropole.includes(department2region[departement]))) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_DEPARTEMENT_HORS_METROPOLE);
        }

        // const { ligneDeBusList, sejoursList, pdrList } = await this.affectationService.loadAffectationData(sessionId);

        let jeuneList = await this.jeuneGateway.findBySessionIdStatutsStatutsPhase1NiveauScolairesAndDepartements(
            sessionId,
            status,
            statusPhase1,
            niveauScolaires,
            departements,
        );
        if (!etranger) {
            jeuneList = jeuneList.filter((jeune) => jeune.paysScolarite === "FRANCE");
        }
        if (cohesionStayPresence) {
            jeuneList = jeuneList.filter((jeune) => jeune.cohesionStayPresence === "true");
        }
        if (statusPhase1Motif.length) {
            jeuneList = jeuneList.filter(
                (jeune) => jeune.departSejourMotif && statusPhase1Motif.includes(jeune.departSejourMotif),
            );
        }
        if (jeuneList.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA, "Aucun jeune !");
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
                    FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA,
                    `Session ${COHORTS.AVENIR} introuvable`,
                );
            }
            for (const jeune of jeuneList) {
                rapportData.jeunesAvenir.push(
                    this.mapJeuneRapport({
                        ...jeune,
                        sessionId: sessionAVenir.id,
                        sessionNom: sessionAVenir.nom,
                    }),
                );
            }
        } else {
            // prochaine sejour eligible
            for (const jeune of jeuneList) {
                const sessions = await this.inscriptionService.getSessionsEligible(jeune);
                if (sessions.length > 0) {
                    rapportData.jeunesProchainSejour.push(
                        this.mapJeuneRapport({
                            ...jeune,
                            sessionId: sessions[0].id,
                            sessionNom: sessions[0].nom,
                        }),
                    );
                } else {
                    rapportData.jeunesRefuses.push(
                        this.mapJeuneRapport({
                            ...jeune,
                            statut: YOUNG_STATUS.REFUSED,
                        }),
                    );
                }
            }
        }

        // Calcul des données pour le rapport excel
        const fileBuffer = await this.fileGateway.generateExcel({
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
                mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

    mapJeuneRapport(jeune: JeuneModel): JeuneRapport {
        return {
            id: jeune.id,
            statut: jeune.statut,
            statutPhase1: jeune.statutPhase1,
            prenom: jeune.prenom,
            nom: jeune.nom,
            genre: jeune.genre === "female" ? "fille" : "garçon",
            qpv: ["true", "oui"].includes(jeune.qpv!) ? "oui" : "non",
            psh: ["true", "oui"].includes(jeune.psh!) ? "oui" : "non",
            handicapMemeDepartement: ["true", "oui"].includes(jeune.handicapMemeDepartement!) ? "oui" : "non",
            sessionNom: jeune.sessionNom,
            region: jeune.region,
            departement: jeune.departement,
            regionScolarite: jeune.regionScolarite,
            departementScolarite: jeune.departementScolarite,
        };
    }
}
