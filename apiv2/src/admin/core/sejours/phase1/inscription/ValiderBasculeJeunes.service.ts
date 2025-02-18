import { Inject, Injectable, Logger } from "@nestjs/common";

import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";

import { JeuneGateway } from "../../jeune/Jeune.gateway";

import { JeuneModel } from "../../jeune/Jeune.model";

import {
    JeuneRapportSimulation,
    RAPPORT_SHEETS,
    RapportData,
    SimulationBasculeJeunesTaskModel,
} from "./SimulationBasculeJeunesTask.model";
import { SessionModel } from "../session/Session.model";
import { BasculeJeuneParams, EmailTemplate } from "@notification/core/Notification";
import { COHORTS } from "snu-lib";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { Transactional } from "@nestjs-cls/transactional";
import { ClsService } from "nestjs-cls";
import { SessionGateway } from "../session/Session.gateway";

export type ValiderBasculeRapportData = Array<
    JeuneRapportSimulation &
        Pick<
            JeuneModel,
            | "classeId"
            | "sessionId"
            | "sessionNom"
            | "email"
            | "telephone"
            | "parent1Prenom"
            | "parent1Nom"
            | "parent1Email"
            | "parent1Telephone"
            | "parent2Prenom"
            | "parent2Nom"
            | "parent2Email"
            | "parent2Telephone"
        > & {
            emailTemplateId?: EmailTemplate | "";
            erreur?: string;
        }
>;

export type ValiderBasculeJeuneRapport = ValiderBasculeRapportData[0];

export type ValiderBasculeJeunesResult = {
    rapportData: ValiderBasculeRapportData;
    rapportFile: {
        Location: string;
        ETag: string;
        Bucket: string;
        Key: string;
    };
    analytics: {
        jeunesBascules: number;
        errors: number;
    };
};

@Injectable()
export class ValiderBasculeJeunesService {
    constructor(
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        private readonly cls: ClsService,
        private readonly logger: Logger,
    ) {}

    async checkJeune(jeune: JeuneModel, session: SessionModel) {
        // session
        if (jeune?.sessionNom !== session?.nom) {
            this.logger.warn(
                `🚩 Le jeune (${jeune?.id}) a changé de cohort depuis la simulation (session: ${session?.nom}, jeune: ${jeune?.sessionNom})`,
            );
            return `jeune ayant changé de cohorte depuis la simulation (session: ${session?.nom}, jeune: ${jeune?.sessionNom})`;
        }
    }

    @Transactional()
    async updateJeunes({
        session,
        simulationData,
        jeunesProchainSejour,
        jeunesAvenir,
        champsSpecifiqueBascule,
    }: {
        session: SessionModel;
        simulationData: RapportData;
        jeunesProchainSejour: JeuneModel[];
        jeunesAvenir: JeuneModel[];
        champsSpecifiqueBascule?: Partial<JeuneModel>;
    }) {
        // resultats
        const analytics = {
            jeunesBascules: 0,
            errors: 0,
        };
        const jeunesUpdatedList: JeuneModel[] = [];
        const rapportData: ValiderBasculeRapportData = [];

        // Traitement des jeunes à basculer
        for (const jeuneRapportSimu of [...simulationData.jeunesProchainSejour, ...simulationData.jeunesAvenir]) {
            const jeune = [...jeunesProchainSejour, ...jeunesAvenir].find((jeune) => jeune.id === jeuneRapportSimu.id);
            if (!jeune) {
                throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, `jeune ${jeuneRapportSimu.id}`);
            }
            const erreur = await this.checkJeune(jeune, session);
            if (erreur) {
                rapportData.push(this.formatJeuneRapport(jeune, jeuneRapportSimu, { erreur }));
                analytics.errors += 1;
            } else {
                const emailTemplateId = this.getEmailTemplate(jeuneRapportSimu);
                const jeuneUpdated = await this.basculerJeune(
                    jeune,
                    jeuneRapportSimu.nouvelleSessionId!,
                    champsSpecifiqueBascule,
                );
                jeunesUpdatedList.push(jeuneUpdated);
                rapportData.push(
                    this.formatJeuneRapport(jeuneUpdated, jeuneRapportSimu, {
                        emailTemplateId,
                    }),
                );
                analytics.jeunesBascules += 1;
            }
        }

        this.cls.set("user", { firstName: `Script de bascule des volontaires de la cohorte ${session.nom}` });

        await this.jeuneGateway.bulkUpdate(jeunesUpdatedList);

        this.cls.set("user", null);

        return {
            analytics,
            rapportData,
        };
    }

    async basculerJeune(
        jeune: JeuneModel,
        nouvelleSessionId: string,
        champsSpecifiqueBascule: Partial<JeuneModel> = {},
    ) {
        const nouvelleSession = await this.sessionGateway.findById(nouvelleSessionId);
        // on désaffecte le jeune et le bascule
        const jeuneUpdated: JeuneModel = {
            ...jeune,
            sessionId: nouvelleSession.id,
            sessionNom: nouvelleSession.nom,
            originalSessionId: jeune.sessionId,
            originalSessionNom: jeune.sessionNom,
            centreId: undefined,
            sejourId: undefined,
            pointDeRassemblementId: undefined,
            ligneDeBusId: undefined,
            hasPDR: undefined,
            transportInfoGivenByLocal: undefined,
            deplacementPhase1Autonomous: undefined,
            presenceArrivee: undefined,
            presenceJDM: undefined,
            departInform: undefined,
            departSejourAt: undefined,
            departSejourMotif: undefined,
            departSejourMotifComment: undefined,
            youngPhase1Agreement: "false",
            ...champsSpecifiqueBascule,
        };

        this.logger.debug(`🚀 Jeune ${jeune.id} basculé vers ${nouvelleSession.nom}`);
        return jeuneUpdated;
    }

    getEmailTemplate(jeuneRapportSimu: JeuneRapportSimulation) {
        return jeuneRapportSimu.nouvelleSession === COHORTS.AVENIR
            ? EmailTemplate.BASCULE_SEJOUR_AVENIR
            : EmailTemplate.BASCULE_SEJOUR_ELIGIBLE;
    }

    async notifierJeunes(rapportData: ValiderBasculeJeuneRapport[]) {
        for (const jeuneRapport of rapportData) {
            if (jeuneRapport.emailTemplateId) {
                // jeune
                await this.notificationGateway.sendEmail<BasculeJeuneParams>(
                    {
                        to: [{ email: jeuneRapport.email, name: `${jeuneRapport.prenom} ${jeuneRapport.nom}` }],
                        prenom: jeuneRapport.prenom!,
                        nom: jeuneRapport.nom!,
                        ancienneSessionNom: jeuneRapport.ancienneSession!,
                        nouvelleSessionNom: jeuneRapport.nouvelleSession,
                    },
                    jeuneRapport.emailTemplateId,
                );
                // RL 1
                if (jeuneRapport.parent1Email) {
                    await this.notificationGateway.sendEmail<BasculeJeuneParams>(
                        {
                            to: [
                                {
                                    email: jeuneRapport.parent1Email,
                                    name: `${jeuneRapport.prenom} ${jeuneRapport.nom}`,
                                },
                            ],
                            prenom: jeuneRapport.prenom!,
                            nom: jeuneRapport.nom!,
                            ancienneSessionNom: jeuneRapport.ancienneSession!,
                            nouvelleSessionNom: jeuneRapport.nouvelleSession,
                        },
                        jeuneRapport.emailTemplateId,
                    );
                }
                // RL 2
                if (jeuneRapport.parent2Email) {
                    await this.notificationGateway.sendEmail<BasculeJeuneParams>(
                        {
                            to: [
                                {
                                    email: jeuneRapport.parent2Email,
                                    name: `${jeuneRapport.prenom} ${jeuneRapport.nom}`,
                                },
                            ],
                            prenom: jeuneRapport.prenom!,
                            nom: jeuneRapport.nom!,
                            ancienneSessionNom: jeuneRapport.ancienneSession!,
                            nouvelleSessionNom: jeuneRapport.nouvelleSession,
                        },
                        jeuneRapport.emailTemplateId,
                    );
                }
            }
        }
    }

    formatJeuneRapport(
        jeune: JeuneModel,
        jeuneRapportSimu: JeuneRapportSimulation,
        {
            erreur,
            emailTemplateId,
        }: { erreur?: string; emailTemplateId?: ValiderBasculeJeuneRapport["emailTemplateId"] },
    ): ValiderBasculeJeuneRapport {
        return {
            id: jeune.id,
            prenom: jeune.prenom,
            nom: jeune.nom?.toUpperCase(),
            email: jeune.email,
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
            classeId: jeuneRapportSimu.classeId,
            nouvelleSessionId: jeuneRapportSimu.nouvelleSessionId,
            nouvelleSession: jeuneRapportSimu.nouvelleSession,
            ancienneSessionId: jeuneRapportSimu.ancienneSessionId,
            ancienneSession: jeuneRapportSimu.ancienneSession,
            erreur: erreur || "",
            ...(!erreur
                ? {
                      telephone: jeune.telephone,
                      parent1Prenom: jeune.parent1Prenom,
                      parent1Nom: jeune.parent1Nom,
                      parent1Email: jeune.parent1Email,
                      parent1Telephone: jeune.parent1Telephone,
                      parent2Prenom: jeune.parent2Prenom,
                      parent2Nom: jeune.parent2Nom,
                      parent2Email: jeune.parent2Email,
                      parent2Telephone: jeune.parent2Telephone,
                      emailTemplateId,
                  }
                : {}),
        };
    }

    async getRapportSimulation(taskId: string) {
        const simulationTask: SimulationBasculeJeunesTaskModel = await this.taskGateway.findById(taskId);
        const rapportKey = simulationTask.metadata?.results?.rapportKey;
        if (!rapportKey) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                "Fichier associé à la simulation introuvable",
            );
        }
        const importedFile = await this.fileGateway.downloadFile(rapportKey);
        const jeunesAvenir = await this.fileGateway.parseXLS<RapportData["jeunesAvenir"][0]>(importedFile.Body, {
            sheetName: RAPPORT_SHEETS.AVENIR,
        });
        const jeunesProchainSejour = await this.fileGateway.parseXLS<RapportData["jeunesProchainSejour"][0]>(
            importedFile.Body,
            {
                sheetName: RAPPORT_SHEETS.PROCHAINSEJOUR,
            },
        );
        return {
            jeunesAvenir,
            jeunesProchainSejour,
        };
    }

    async getSimulationData(simulationData) {
        const jeunesAvenir = await this.jeuneGateway.findByIds(simulationData.jeunesAvenir.map((jeune) => jeune.id));
        if (jeunesAvenir.length !== simulationData.jeunesAvenir.length) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                "Impossible de récupérer tous les jeunes (Avenir)",
            );
        }
        const jeunesProchainSejour = await this.jeuneGateway.findByIds(
            simulationData.jeunesProchainSejour.map((jeune) => jeune.id),
        );
        if (jeunesProchainSejour.length !== simulationData.jeunesProchainSejour.length) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                "Impossible de récupérer tous les jeunes (ProchainSejour)",
            );
        }
        return { jeunesAvenir, jeunesProchainSejour };
    }
}
