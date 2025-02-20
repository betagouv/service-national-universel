import { Inject, Logger } from "@nestjs/common";
import { ClsService } from "nestjs-cls";
import { Transactional } from "@nestjs-cls/transactional";

import { MIME_TYPES } from "snu-lib";

import { UseCase } from "@shared/core/UseCase";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";

import { JeuneGateway } from "../../jeune/Jeune.gateway";

import { SejourGateway } from "../sejour/Sejour.gateway";

import { SimulationAffectationHTSTaskModel } from "./SimulationAffectationHTSTask.model";
import { RAPPORT_SHEETS, RapportData } from "./SimulationAffectationHTS.service";
import { JeuneModel } from "../../jeune/Jeune.model";
import { AffectationService } from "./Affectation.service";
import { SejourModel } from "../sejour/Sejour.model";
import { ValiderAffectationHTSTaskParameters } from "./ValiderAffectationHTSTask.model"; import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";
import { PointDeRassemblementModel } from "../pointDeRassemblement/PointDeRassemblement.model";

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
    > & {
        ligneDeBusNumeroLigne: string;
        pointDeRassemblementMatricule: string;
        centreNom: string;
        "places restantes après l'inscription (centre)": string | number;
        "places totale (centre)": string | number;
        error?: string;
    }
>;

export type ValiderAffectationHTSResult = {
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

export class ValiderAffectationHTS implements UseCase<ValiderAffectationHTSResult> {
    constructor(
        @Inject(AffectationService) private readonly affectationService: AffectationService,
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
        affecterPDR,
        dateAffectation,
    }: ValiderAffectationHTSTaskParameters): Promise<ValiderAffectationHTSResult> {
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
            simulationJeunesAAffecterList.map((jeune) => jeune.id),
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
        const rapportData: Array<ReturnType<typeof this.formatJeuneRapport>> = [];

        // Traitement des jeunes
        for (const jeuneRapport of simulationJeunesAAffecterList) {
            const jeune = jeuneAAffecterList.find((jeune) => jeune.id === jeuneRapport.id)!;
            const ligneDeBus = ligneDeBusList.find((ligne) => ligne.id === jeuneRapport.ligneDeBusId);
            const sejour = sejoursList.find((sejour) => sejour.id === jeuneRapport.sejourId);
            const pdr = pdrList.find((pdr) => pdr.id === jeuneRapport["Point de rassemblement calculé"]); // TODO: utiliser le matricule

            // Controle de coherence
            if (!sejour) {
                this.logger.warn(`🚩 sejour introuvable: ${jeuneRapport.sejourId} (jeune: ${jeune.id})`);
                throw new FunctionalException(
                    FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA,
                    `sejour non trouvé ${jeuneRapport.sejourId} (jeune: ${jeune.id})`,
                );
            }
            if (!sejour.placesRestantes || sejour.placesRestantes < 0) {
                console.error(`🚩 plus de place pour ce sejour: ${sejour.id} (jeune: ${jeune.id})`);
                rapportData.push(
                    this.formatJeuneRapport(jeune, sejour, ligneDeBus, pdr, "plus de place pour ce sejour"),
                );
                analytics.errors += 1;
                continue;
            }
            // session
            if (jeune?.sessionNom !== sejour?.sessionNom) {
                this.logger.warn(
                    `🚩 Le jeune (${jeune?.id}) a changé de cohort depuis la simulation (sejour: ${sejour?.sessionNom}, jeune: ${jeune?.sessionNom})`,
                );
                rapportData.push(
                    this.formatJeuneRapport(
                        jeune,
                        sejour,
                        ligneDeBus,
                        pdr,
                        "jeune ayant changé de cohorte depuis la simulation",
                    ),
                );
                analytics.errors += 1;
                continue;
            }
            // ligne de bus / PDR
            if (affecterPDR) {
                if (!ligneDeBus) {
                    this.logger.error(
                        `🚩 Ligne de bus introuvable (${jeuneRapport.ligneDeBusId}) => jeune ${jeune.id} ignored.`,
                    );
                    throw new FunctionalException(
                        FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA,
                        `ligne de bus non trouvée ${jeuneRapport.ligneDeBusId} (jeune: ${jeune.id})`,
                    );
                }
                if (!pdr) {
                    this.logger.error(
                        `🚩 Point de rassemblement introuvable (${jeuneRapport["Point de rassemblement calculé"]}) => jeune ${jeune.id} ignored.`,
                    );
                    throw new FunctionalException(
                        FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA,
                        `point de rassemblement non trouvé ${jeuneRapport["Point de rassemblement calculé"]} (jeune: ${jeune.id})`,
                    );
                }
            }

            // Affectation du jeune
            sejour.placesRestantes = sejour.placesRestantes - 1;

            const jeuneUpdated = this.affectationService.mapAffectationJeune(jeune, sejour, {
                ...(affecterPDR
                    ? {
                          pointDeRassemblementId: pdr!.id,
                          ligneDeBusId: ligneDeBus!.id,
                          hasPDR: "true",
                      }
                    : {}),
                transportInfoGivenByLocal: undefined, // Metropole
            });

            this.logger.log(
                `🚀 Jeune affecté: ${jeune.id}, centre: ${jeuneUpdated.centreId}, sejour: ${
                    jeuneUpdated.sejourId
                }, ligneDeBus: ${jeuneUpdated.ligneDeBusId}, pdr: ${jeuneUpdated.pointDeRassemblementId}, ${
                    jeuneUpdated.hasPDR
                } (${analytics.jeunesAffected + 1}/${jeuneAAffecterList.length})`,
            );

            jeunesUpdatedList.push(jeuneUpdated);
            rapportData.push(this.formatJeuneRapport(jeuneUpdated, sejour, ligneDeBus, pdr));
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
        const fileName = `affectation-hts/affectation_${sessionId}_${timestamp}.xlsx`;
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

    formatJeuneRapport(
        jeune: JeuneModel,
        sejour: SejourModel,
        ligneDeBus?: LigneDeBusModel,
        pdr?: PointDeRassemblementModel,
        error = "",
    ): ValiderAffectationRapportData[0] {
        return {
            id: jeune.id,
            statut: jeune.statut,
            statutPhase1: jeune.statutPhase1,
            genre: jeune.genre === "female" ? "fille" : "garçon",
            qpv: ["true", "oui"].includes(jeune.qpv!) ? "oui" : "non",
            psh: ["true", "oui"].includes(jeune.psh!) ? "oui" : "non",
            email: jeune.email,
            region: jeune.region,
            departement: jeune.departement,
            sessionId: sejour?.id || "",
            sessionNom: jeune.sessionNom,
            ligneDeBusId: jeune.ligneDeBusId || "",
            ligneDeBusNumeroLigne: ligneDeBus?.numeroLigne || "",
            pointDeRassemblementId: jeune.pointDeRassemblementId || "",
            pointDeRassemblementMatricule: pdr?.matricule || "",
            centreId: sejour?.centreId || "",
            centreNom: sejour?.centreNom || "",
            "places restantes après l'inscription (centre)": sejour?.placesRestantes || "",
            "places totale (centre)": sejour?.placesTotal || "",
            error,
            ...(!error
                ? {
                      prenom: jeune.prenom,
                      nom: jeune.nom,
                      email: jeune.email,
                      telephone: jeune.telephone,
                      dateNaissance: jeune.dateNaissance,
                      parent1Prenom: jeune.parent1Prenom,
                      parent1Nom: jeune.parent1Nom,
                      parent1Email: jeune.parent1Email,
                      parent1Telephone: jeune.parent1Telephone,
                      parent2Prenom: jeune.parent2Prenom,
                      parent2Nom: jeune.parent2Nom,
                      parent2Email: jeune.parent2Email,
                      parent2Telephone: jeune.parent2Telephone,
                  }
                : {}),
        };
    }

    async getSimulationData(taskId: string) {
        const simulationTask: SimulationAffectationHTSTaskModel = await this.taskGateway.findById(taskId);
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
                sheetName: RAPPORT_SHEETS.AFFECTES,
            },
        );
        return parsedFile;
    }
}
