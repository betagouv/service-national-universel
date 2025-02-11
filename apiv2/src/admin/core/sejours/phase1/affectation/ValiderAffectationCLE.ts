import { Inject, Logger } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { Transactional } from "@nestjs-cls/transactional";

import { MIME_TYPES, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";

import { UseCase } from "@shared/core/UseCase";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";

import { JeuneGateway } from "../../jeune/Jeune.gateway";

import { SejourGateway } from "../sejour/Sejour.gateway";

import { SimulationAffectationCLETaskModel } from "./SimulationAffectationCLETask.model";
import { RAPPORT_SHEETS, RapportData } from "./SimulationAffectationCLE.service";
import { JeuneModel } from "../../jeune/Jeune.model";
import { AffectationService } from "./Affectation.service";
import { SejourModel } from "../sejour/Sejour.model";
import { ValiderAffectationCLETaskParameters } from "./ValiderAffectationCLETask.model";
import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";
import { PointDeRassemblementModel } from "../pointDeRassemblement/PointDeRassemblement.model";
import { ValiderAffectationCLEService } from "./ValiderAffectationCLE.service";

export type ValiderAffectationRapportData = Array<
    Pick<
        JeuneModel,
        | "id"
        | "statut"
        | "statutPhase1"
        | "genre"
        | "qpv"
        | "psh"
        | "email"
        | "region"
        | "departement"
        | "sessionId"
        | "sessionNom"
        | "ligneDeBusId"
        | "pointDeRassemblementId"
        | "prenom"
        | "nom"
        | "telephone"
        | "dateNaissance"
        | "parent1Prenom"
        | "parent1Nom"
        | "parent1Email"
        | "parent1Telephone"
        | "parent2Prenom"
        | "parent2Nom"
        | "parent2Email"
        | "parent2Telephone"
        | "centreId"
        | "classeId"
    > & {
        ligneDeBusNumeroLigne?: string;
        pointDeRassemblementMatricule?: string;
        centreNom: string;
        "places restantes après l'inscription (centre)": string | number;
        "places totale (centre)": string | number;
        erreur?: string;
    }
>;

export type ValiderAffectationCLEResult = {
    rapportData: ValiderAffectationRapportData;
    rapportFile: {
        Location: string;
        ETag: string;
        Bucket: string;
        Key: string;
    };
    analytics: {
        jeunesAffected: number;
        errors: number;
    };
};

export class ValiderAffectationCLE implements UseCase<ValiderAffectationCLEResult> {
    constructor(
        @Inject(AffectationService) private readonly affectationService: AffectationService,
        @Inject(ValiderAffectationCLEService) private validerAffectationCLEService: ValiderAffectationCLEService,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(SejourGateway) private readonly sejoursGateway: SejourGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        private readonly cls: ClsService,
        private readonly logger: Logger,
    ) {}
    @Transactional()
    async execute({
        sessionId,
        simulationTaskId,
        dateAffectation,
    }: ValiderAffectationCLETaskParameters): Promise<ValiderAffectationCLEResult> {
        // Récuperation des données de l'affectation pour la session
        const { session, ligneDeBusList, sejoursList, pdrList } =
            await this.affectationService.loadAffectationData(sessionId);
        // Récupération des données du rapport de simulation
        const simulationJeunesAAffecterList = await this.getSimulationData(simulationTaskId);

        this.logger.debug("Sessions found: " + sejoursList.length);
        this.logger.debug("Meeting points found: " + pdrList.length);
        this.logger.debug("Bus lines found: " + ligneDeBusList.length);
        this.logger.debug("Young to affect: " + simulationJeunesAAffecterList.length);

        const jeuneAAffecterList = await this.jeuneGateway.findByIds(
            simulationJeunesAAffecterList.map((jeune) => jeune["id du volontaire"]),
        );
        if (jeuneAAffecterList.length !== simulationJeunesAAffecterList.length) {
            throw new FunctionalException(
                FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA,
                "Impossible de récupérer tous les jeunes",
            );
        }

        // resultats
        const analytics = {
            jeunesAffected: 0,
            errors: 0,
        };
        const jeunesUpdatedList: JeuneModel[] = [];
        const rapportData: Array<ReturnType<typeof this.validerAffectationCLEService.formatJeuneRapport>> = [];

        // Traitement des jeunes
        for (const jeuneRapport of simulationJeunesAAffecterList) {
            const jeune = jeuneAAffecterList.find((jeune) => jeune.id === jeuneRapport["id du volontaire"])!;

            const ligneDeBus = ligneDeBusList.find((ligne) => ligne.id === jeuneRapport.jeuneLigneId);
            const sejour = sejoursList.find((sejour) => sejour.id === jeuneRapport.sejourId);
            const pdr = pdrList.find((pdr) => pdr.id === jeuneRapport.pointDeRassemblementId); // TODO: utiliser le matricule

            // Controle de coherence
            const erreur = this.validerAffectationCLEService.checkValiderAffectation(jeuneRapport, jeune, sejour);
            if (erreur) {
                rapportData.push(
                    this.validerAffectationCLEService.formatJeuneRapport(jeune, sejour, ligneDeBus, pdr, erreur),
                );
                continue;
            }

            if (!ligneDeBus) {
                this.logger.error(
                    `🚩 Ligne de bus introuvable (${jeuneRapport.jeuneLigneId}) => jeune ${jeune.id} ignored.`,
                );
                throw new FunctionalException(
                    FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA,
                    `ligne de bus non trouvée ${jeuneRapport.jeuneLigneId} (jeune: ${jeune.id})`,
                );
            }
            if (!pdr) {
                this.logger.error(
                    `🚩 Point de rassemblement introuvable (${jeuneRapport.pointDeRassemblementId}) => jeune ${jeune.id} ignored.`,
                );
                throw new FunctionalException(
                    FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA,
                    `point de rassemblement non trouvé ${jeuneRapport.pointDeRassemblementId} (jeune: ${jeune.id})`,
                );
            }

            // Affectation du jeune
            sejour!.placesRestantes = (sejour!.placesRestantes || 0) - 1;

            const jeuneUpdated: JeuneModel = {
                ...jeune,
                centreId: jeuneRapport.classeCenterId,
                sejourId: jeuneRapport.sejourId,
                statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,

                // specifique Metropole
                pointDeRassemblementId: jeuneRapport.pointDeRassemblementId,
                ligneDeBusId: jeuneRapport.jeuneLigneId,
                hasPDR: "true",
                transportInfoGivenByLocal: undefined,

                //Clean le reste
                deplacementPhase1Autonomous: undefined,
                presenceArrivee: undefined,
                presenceJDM: undefined,
                departInform: undefined,
                departSejourAt: undefined,
                departSejourMotif: undefined,
                departSejourMotifComment: undefined,
                youngPhase1Agreement: "false",
            };

            this.logger.log(
                `🚀 Jeune affecté: ${jeune.id}, centre: ${jeuneUpdated.centreId}, sejour: ${
                    jeuneUpdated.sejourId
                }, ligneDeBus: ${jeuneUpdated.ligneDeBusId}, pdr: ${jeuneUpdated.pointDeRassemblementId}, ${
                    jeuneUpdated.hasPDR
                } (${analytics.jeunesAffected + 1}/${jeuneAAffecterList.length})`,
            );

            jeunesUpdatedList.push(jeuneUpdated);
            rapportData.push(
                this.validerAffectationCLEService.formatJeuneRapport(jeuneUpdated, sejour, ligneDeBus, pdr),
            );
            analytics.jeunesAffected += 1;
        }

        this.cls.set("user", { firstName: `Affectation ${session.nom}` });

        await this.jeuneGateway.bulkUpdate(jeunesUpdatedList);

        // mise à jour des placesRestantes dans les centres
        this.logger.log(`Mise à jour des places dans les séjours`);
        await this.sejoursGateway.bulkUpdate(sejoursList);

        // mise à jour des placesOccupeesJeunes dans les bus
        this.logger.log(`Mise à jour des places dans les lignes de bus et PDT`);
        await this.affectationService.syncPlaceDisponiblesLigneDeBus(ligneDeBusList);

        this.cls.set("user", null);

        // création du fichier excel de rapport
        const fileBuffer = await this.fileGateway.generateExcel({ Affectations: rapportData });

        // upload du rapport du s3
        const timestamp = `${dateAffectation.toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
        const fileName = `affectation-cle/affectation_${sessionId}_${timestamp}.xlsx`;
        const rapportFile = await this.fileGateway.uploadFile(
            `file/admin/sejours/phase1/affectation/${sessionId}/${fileName}`,
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
        const parsedFile = await this.fileGateway.parseXLS<RapportData["jeunesNouvellementAffectedList"][0]>(
            importedFile.Body,
            {
                sheetName: RAPPORT_SHEETS.VOLONTAIRES,
            },
        );
        return parsedFile;
    }
}
