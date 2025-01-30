import { Inject, Logger } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { Transactional } from "@nestjs-cls/transactional";

import { MIME_TYPES, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";

import { UseCase } from "@shared/core/UseCase";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";

import { JeuneGateway } from "../../jeune/Jeune.gateway";

import { JeuneModel } from "../../jeune/Jeune.model";
import { ValiderBasculeJeunesValidesTaskParameters } from "./ValiderBasculeJeunesValides.model";
import { SimulationAffectationCLETaskModel } from "../affectation/SimulationAffectationCLETask.model";
import { JeuneRapport, RAPPORT_SHEETS, RapportData } from "./SimulationBasculeJeunesValidesTask.model";
import { SessionGateway } from "../session/Session.gateway";
import { SessionModel } from "../session/Session.model";
import { BasculeJeuneParams, EmailTemplate } from "@notification/core/Notification";
import { NotificationGateway } from "@notification/core/Notification.gateway";

export type ValiderBasculeRapportData = Array<
    JeuneRapport &
        Pick<JeuneModel, "sessionId" | "sessionNom" | "email"> & {
            emailTemplateId?: EmailTemplate | "";
            erreur?: string;
        }
>;

export type ValiderBasculeJeunesValidesResult = {
    rapportData: ValiderBasculeRapportData;
    rapportFile: {
        Location: string;
        ETag: string;
        Bucket: string;
        Key: string;
    };
    analytics: {
        jeunesBascules: number;
        jeunesRefuses: number;
        errors: number;
    };
};

export class ValiderBasculeJeunesValides implements UseCase<ValiderBasculeJeunesValidesResult> {
    constructor(
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        private readonly cls: ClsService,
        private readonly logger: Logger,
    ) {}

    async execute({
        sessionId,
        simulationTaskId,
        dateValidation,
        sendEmail,
    }: ValiderBasculeJeunesValidesTaskParameters): Promise<ValiderBasculeJeunesValidesResult> {
        // Récuperation des données de l'affectation pour la session
        const session = await this.sessionGateway.findById(sessionId);

        // // Récupération des données du rapport de simulation
        const simulationData = await this.getSimulationData(simulationTaskId);

        this.logger.debug("Jeunes prochain sejour: " + simulationData.jeunesProchainSejour.length);
        this.logger.debug("Jeunes avenir: " + simulationData.jeunesAvenir.length);
        this.logger.debug("Jeunes refuses: " + simulationData.jeunesRefuses.length);

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
        const jeunesRefuses = await this.jeuneGateway.findByIds(simulationData.jeunesRefuses.map((jeune) => jeune.id));
        if (jeunesRefuses.length !== simulationData.jeunesRefuses.length) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                "Impossible de récupérer tous les jeunes (Refuses)",
            );
        }

        // update jeunes with transaction
        const { analytics, rapportData } = await this.updateJeunes(
            session,
            simulationData,
            jeunesProchainSejour,
            jeunesAvenir,
            jeunesRefuses,
        );

        // send emails when transaction is commited
        if (sendEmail) {
            for (const jeuneRapport of rapportData) {
                if (jeuneRapport.emailTemplateId) {
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
                }
            }
        }

        // création du fichier excel de rapport
        const fileBuffer = await this.fileGateway.generateExcel({ Volontaires: rapportData });

        // upload du rapport du s3
        const timestamp = `${dateValidation.toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
        const fileName = `valider-bascule-jeunes-valides/bascule-jeunes-valides_${sessionId}_${timestamp}.xlsx`;
        const rapportFile = await this.fileGateway.uploadFile(
            `file/admin/sejours/phase1/inscription/bascule/${sessionId}/${fileName}`,
            {
                data: fileBuffer,
                mimetype: MIME_TYPES.EXCEL,
            },
        );

        return {
            rapportData,
            rapportFile,
            analytics,
        };
    }

    @Transactional()
    async updateJeunes(session, simulationData, jeunesProchainSejour, jeunesAvenir, jeunesRefuses) {
        // resultats
        const analytics = {
            jeunesBascules: 0,
            jeunesRefuses: 0,
            errors: 0,
        };
        const jeunesUpdatedList: JeuneModel[] = [];
        const rapportData: Array<ReturnType<typeof this.formatJeuneRapport>> = [];

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
                const emailTemplateId = this.getEmailTemplate(jeune, jeuneRapportSimu);
                const jeuneUpdated = await this.basculerJeune(jeune, jeuneRapportSimu.nouvelleSessionId!);
                jeunesUpdatedList.push(jeuneUpdated);
                rapportData.push(this.formatJeuneRapport(jeuneUpdated, jeuneRapportSimu, { emailTemplateId }));
                analytics.jeunesBascules += 1;
            }
        }
        // Traitement des jeunes à refuser
        for (const jeuneRapportSimu of simulationData.jeunesRefuses) {
            const jeune = jeunesRefuses.find((jeune) => jeune.id === jeuneRapportSimu.id)!;
            const erreur = await this.checkJeune(jeune, session);
            if (erreur) {
                rapportData.push(this.formatJeuneRapport(jeune, jeuneRapportSimu, { erreur }));
                analytics.errors += 1;
            } else {
                const emailTemplateId = this.getEmailTemplate(jeune, jeuneRapportSimu);
                const jeuneUpdated = await this.refuserJeune(jeune);
                jeunesUpdatedList.push(jeuneUpdated);
                rapportData.push(this.formatJeuneRapport(jeuneUpdated, jeuneRapportSimu, { emailTemplateId }));
                analytics.jeunesRefuses += 1;
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

    async checkJeune(jeune: JeuneModel, session: SessionModel) {
        // session
        if (jeune?.sessionNom !== session?.nom) {
            this.logger.warn(
                `🚩 Le jeune (${jeune?.id}) a changé de cohort depuis la simulation (session: ${session?.nom}, jeune: ${jeune?.sessionNom})`,
            );
            return `jeune ayant changé de cohorte depuis la simulation (session: ${session?.nom}, jeune: ${jeune?.sessionNom})`;
        }
    }

    getEmailTemplate(jeune: JeuneModel, jeuneRapportSimu: JeuneRapport) {
        const isRefuse = jeuneRapportSimu.statut === YOUNG_STATUS.REFUSED;
        let emailTemplateId: ValiderBasculeRapportData[0]["emailTemplateId"] = "";
        if (jeune.statut === YOUNG_STATUS.WAITING_LIST) {
            emailTemplateId = isRefuse
                ? EmailTemplate.BASCULE_SEJOUR_WAITING_LIST_REFUSE
                : EmailTemplate.BASCULE_SEJOUR_WAITING_LIST_ELIGIBLE;
        } else if (jeune.statut === YOUNG_STATUS.VALIDATED) {
            emailTemplateId = isRefuse
                ? EmailTemplate.BASCULE_SEJOUR_VALIDATED_REFUSE
                : EmailTemplate.BASCULE_SEJOUR_VALIDATED_ELIGIBLE;
        }
        return emailTemplateId;
    }

    async basculerJeune(jeune: JeuneModel, nouvelleSessionId: string) {
        const nouvelleSession = await this.sessionGateway.findById(nouvelleSessionId);
        // on désaffecte le jeune
        const jeuneUpdated: JeuneModel = {
            ...jeune,
            statut: YOUNG_STATUS.WAITING_VALIDATION,
            statutPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
            sessionId: nouvelleSession.id,
            sessionNom: nouvelleSession.nom,
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
        };

        this.logger.debug(`🚀 Jeune ${jeune.id} basculé vers ${nouvelleSession.nom}`);
        return jeuneUpdated;
    }

    refuserJeune(jeune: JeuneModel) {
        this.logger.debug(`❌ Jeune ${jeune.id} refusé`);
        return {
            ...jeune,
            statut: YOUNG_STATUS.REFUSED,
        };
    }

    formatJeuneRapport(
        jeune: JeuneModel,
        jeuneRapportSimu: JeuneRapport,
        {
            erreur,
            emailTemplateId,
        }: { erreur?: string; emailTemplateId?: ValiderBasculeRapportData[0]["emailTemplateId"] },
    ): ValiderBasculeRapportData[0] {
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

    async getSimulationData(taskId: string) {
        const simulationTask: SimulationAffectationCLETaskModel = await this.taskGateway.findById(taskId);
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
        const jeunesRefuses = await this.fileGateway.parseXLS<RapportData["jeunesRefuses"][0]>(importedFile.Body, {
            sheetName: RAPPORT_SHEETS.REFUSES,
        });
        return {
            jeunesAvenir,
            jeunesProchainSejour,
            jeunesRefuses,
        };
    }
}
