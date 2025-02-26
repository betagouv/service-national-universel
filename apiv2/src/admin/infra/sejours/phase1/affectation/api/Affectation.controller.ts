import { Body, Controller, Get, Inject, Logger, Param, Post, Request, UseGuards } from "@nestjs/common";

import {
    AffectationRoutes,
    TaskName,
    TaskStatus,
    SimulationAffectationHTSTaskParameters,
    ValiderAffectationHTSTaskParameters,
    SimulationAffectationCLETaskParameters,
    ValiderAffectationCLETaskParameters,
} from "snu-lib";

import { TaskGateway } from "@task/core/Task.gateway";
import { AdminGuard } from "@admin/infra/iam/guard/Admin.guard";
import { TaskMapper } from "@task/infra/Task.mapper";
import { CustomRequest } from "@shared/infra/CustomRequest";

import {
    PostSimulationsCleDromcomPayloadDto,
    PostSimulationsClePayloadDto,
    PostSimulationsHtsPayloadDto,
    PostSimulationValiderPayloadDto,
} from "./Affectation.validation";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import {
    AffectationService,
    StatusSimulation,
    StatusValidation,
} from "@admin/core/sejours/phase1/affectation/Affectation.service";
import { ReferentielImportTaskModel } from "@admin/core/referentiel/routes/ReferentielImportTask.model";
import { SimulationAffectationHTSService } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTS.service";
import { SimulationAffectationHTSTaskModel } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTSTask.model";
import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { SejourGateway } from "@admin/core/sejours/phase1/sejour/Sejour.gateway";
import { LigneDeBusGateway } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.gateway";
import { SessionGateway } from "@admin/core/sejours/phase1/session/Session.gateway";

@Controller("affectation")
export class AffectationController {
    constructor(
        private readonly affectationService: AffectationService,
        private readonly simulationAffectationHTSService: SimulationAffectationHTSService,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(LigneDeBusGateway) private readonly ligneDeBusGateway: LigneDeBusGateway,
        @Inject(SejourGateway) private readonly sejourGateway: SejourGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        private readonly logger: Logger,
    ) {}

    @UseGuards(AdminGuard)
    @Get("/:sessionId/:type")
    async getStatus(
        @Param("sessionId") sessionId: string,
        @Param("type") type: string,
    ): Promise<AffectationRoutes["GetAffectation"]["response"]> {
        let simulation: StatusSimulation;
        let traitement: StatusValidation;
        switch (type) {
            case "HTS":
                simulation = await this.affectationService.getStatusSimulation(
                    sessionId,
                    TaskName.AFFECTATION_HTS_SIMULATION,
                );
                traitement = await this.affectationService.getStatusValidation(
                    sessionId,
                    TaskName.AFFECTATION_HTS_SIMULATION_VALIDER,
                );
                break;
            case "CLE":
                simulation = await this.affectationService.getStatusSimulation(
                    sessionId,
                    TaskName.AFFECTATION_CLE_SIMULATION,
                );
                traitement = await this.affectationService.getStatusValidation(
                    sessionId,
                    TaskName.AFFECTATION_CLE_SIMULATION_VALIDER,
                );
                break;
            case "CLE_DROMCOM":
                simulation = await this.affectationService.getStatusSimulation(
                    sessionId,
                    TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION,
                );
                traitement = await this.affectationService.getStatusValidation(
                    sessionId,
                    TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION_VALIDER,
                );
                break;
            default:
                throw new FunctionalException(
                    FunctionalExceptionCode.NOT_IMPLEMENTED_YET,
                    "Type d'affectation invalide",
                );
        }

        return {
            simulation,
            traitement: {
                ...traitement,
                lastCompletedAt: traitement.lastCompletedAt?.toISOString(),
            },
        };
    }

    @UseGuards(AdminGuard)
    @Post("/:sessionId/simulation/hts")
    async simulateHts(
        @Request() request: CustomRequest,
        @Param("sessionId") sessionId: string,
        @Body() payload: PostSimulationsHtsPayloadDto,
    ): Promise<AffectationRoutes["PostSimulationsHTSRoute"]["response"]> {
        const importTask: ReferentielImportTaskModel = await this.taskGateway.findById(payload.sdrImportId);
        if (!importTask.metadata?.parameters?.fileKey) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                "Fichier associé à l'import des routes introuvable",
            );
        }
        const parameters: SimulationAffectationHTSTaskParameters = {
            sessionId,
            departements: payload.departements,
            niveauScolaires: payload.niveauScolaires,
            sdrImportId: payload.sdrImportId,
            sdrFileName: importTask.metadata.parameters.fileName,
            etranger: payload.etranger,
            affecterPDR: payload.affecterPDR,
            auteur: {
                id: request.user.id,
                prenom: request.user.prenom,
                nom: request.user.nom,
                role: request.user.role,
                sousRole: request.user.sousRole,
            },
        };
        const task = await this.taskGateway.create({
            name: TaskName.AFFECTATION_HTS_SIMULATION,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }

    @UseGuards(AdminGuard)
    @Get("/simulation/hts/:id/analytics")
    async getSimulation(
        @Param("id")
        id: string,
    ): Promise<AffectationRoutes["GetSimulationAnalytics"]["response"]> {
        const simulation = (await this.taskGateway.findById(id)) as SimulationAffectationHTSTaskModel;
        if (!simulation.metadata?.results?.rapportKey) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        return await this.simulationAffectationHTSService.extractPdfAnalyticsFromRapport(simulation);
    }

    @UseGuards(AdminGuard)
    @Post("/:sessionId/simulation/cle")
    async simulateCle(
        @Request() request: CustomRequest,
        @Param("sessionId") sessionId: string,
        @Body() payload: PostSimulationsClePayloadDto,
    ): Promise<AffectationRoutes["PostSimulationsCLERoute"]["response"]> {
        const parameters: SimulationAffectationCLETaskParameters = {
            sessionId,
            departements: payload.departements,
            etranger: payload.etranger,
            auteur: {
                id: request.user.id,
                prenom: request.user.prenom,
                nom: request.user.nom,
                role: request.user.role,
                sousRole: request.user.sousRole,
            },
        };
        const task = await this.taskGateway.create({
            name: TaskName.AFFECTATION_CLE_SIMULATION,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }

    @UseGuards(AdminGuard)
    @Post("/:sessionId/simulation/cle-dromcom")
    async simulateCleDromCom(
        @Request() request: CustomRequest,
        @Param("sessionId") sessionId: string,
        @Body() payload: PostSimulationsCleDromcomPayloadDto,
    ): Promise<AffectationRoutes["PostSimulationsCLEDromComRoute"]["response"]> {
        const parameters: SimulationAffectationCLETaskParameters = {
            sessionId,
            departements: payload.departements,
            etranger: payload.etranger,
            auteur: {
                id: request.user.id,
                prenom: request.user.prenom,
                nom: request.user.nom,
                role: request.user.role,
                sousRole: request.user.sousRole,
            },
        };
        const task = await this.taskGateway.create({
            name: TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }

    @UseGuards(AdminGuard)
    @Post("/:sessionId/simulation/:taskId/valider/hts")
    async validerSimulationHTS(
        @Request() request: CustomRequest,
        @Param("sessionId") sessionId: string,
        @Param("taskId") taskId: string,
        @Body() payload: PostSimulationValiderPayloadDto,
    ): Promise<AffectationRoutes["PostSimulationsHTSRoute"]["response"]> {
        const simulationTask = await this.taskGateway.findById(taskId);

        // On verifie qu'une simulation n'a pas déjà été affecté en amont
        const { status, lastCompletedAt } = await this.affectationService.getStatusValidation(
            sessionId,
            TaskName.AFFECTATION_HTS_SIMULATION_VALIDER,
        );

        if (
            [TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(status as TaskStatus) ||
            (lastCompletedAt && simulationTask.createdAt <= lastCompletedAt)
        ) {
            throw new FunctionalException(FunctionalExceptionCode.SIMULATION_OUTDATED);
        }

        const parameters: ValiderAffectationHTSTaskParameters = {
            sessionId,
            simulationTaskId: taskId,
            affecterPDR: payload.affecterPDR,
            auteur: {
                id: request.user.id,
                prenom: request.user.prenom,
                nom: request.user.nom,
                role: request.user.role,
                sousRole: request.user.sousRole,
            },
        };
        const task = await this.taskGateway.create({
            name: TaskName.AFFECTATION_HTS_SIMULATION_VALIDER,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }

    @UseGuards(AdminGuard)
    @Post("/:sessionId/simulation/:taskId/valider/cle")
    async validerSimulationCLE(
        @Request() request: CustomRequest,
        @Param("sessionId") sessionId: string,
        @Param("taskId") taskId: string,
    ): Promise<AffectationRoutes["PostSimulationsCLERoute"]["response"]> {
        const simulationTask = await this.taskGateway.findById(taskId);

        // On verifie qu'une simulation n'a pas déjà été affecté en amont
        const { status, lastCompletedAt } = await this.affectationService.getStatusValidation(
            sessionId,
            TaskName.AFFECTATION_CLE_SIMULATION_VALIDER,
        );

        if (
            [TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(status as TaskStatus) ||
            (lastCompletedAt && simulationTask.createdAt <= lastCompletedAt)
        ) {
            throw new FunctionalException(FunctionalExceptionCode.SIMULATION_OUTDATED);
        }

        const parameters: ValiderAffectationCLETaskParameters = {
            sessionId,
            simulationTaskId: taskId,
            auteur: {
                id: request.user.id,
                prenom: request.user.prenom,
                nom: request.user.nom,
                role: request.user.role,
                sousRole: request.user.sousRole,
            },
        };
        const task = await this.taskGateway.create({
            name: TaskName.AFFECTATION_CLE_SIMULATION_VALIDER,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }

    @UseGuards(AdminGuard)
    @Post("/:sessionId/simulation/:taskId/valider/cle-dromcom")
    async validerSimulationCLEDromCom(
        @Request() request: CustomRequest,
        @Param("sessionId") sessionId: string,
        @Param("taskId") taskId: string,
    ): Promise<AffectationRoutes["PostValiderAffectationCLEDromComRoute"]["response"]> {
        const simulationTask = await this.taskGateway.findById(taskId);

        // On verifie qu'une simulation n'a pas déjà été affecté en amont
        const { status, lastCompletedAt } = await this.affectationService.getStatusValidation(
            sessionId,
            TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION_VALIDER,
        );

        if (
            [TaskStatus.IN_PROGRESS, TaskStatus.PENDING].includes(status as TaskStatus) ||
            (lastCompletedAt && simulationTask.createdAt <= lastCompletedAt)
        ) {
            throw new FunctionalException(FunctionalExceptionCode.SIMULATION_OUTDATED);
        }

        const parameters: ValiderAffectationCLETaskParameters = {
            sessionId,
            simulationTaskId: taskId,
            auteur: {
                id: request.user.id,
                prenom: request.user.prenom,
                nom: request.user.nom,
                role: request.user.role,
                sousRole: request.user.sousRole,
            },
        };
        const task = await this.taskGateway.create({
            name: TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION_VALIDER,
            status: TaskStatus.PENDING,
            metadata: {
                parameters,
            },
        });
        return TaskMapper.toDto(task);
    }

    @UseGuards(SuperAdminGuard)
    @Post("/:sessionId/ligne-de-bus/sync-places")
    async syncLigneDebus(
        @Param("sessionId")
        sessionId: string,
    ): Promise<AffectationRoutes["PostSyncPlacesLigneDeBus"]["response"]> {
        const session = await this.sessionGateway.findById(sessionId);
        const ligneDeBusList = await this.ligneDeBusGateway.findBySessionNom(session.nom);
        await this.affectationService.syncPlacesDisponiblesLignesDeBus(ligneDeBusList);
    }

    @UseGuards(SuperAdminGuard)
    @Post("/:sessionId/centre/:centreId/sync-places")
    async syncCentre(
        @Param("sessionId")
        sessionId: string,
        @Param("centreId")
        centreId: string,
    ): Promise<AffectationRoutes["PostSyncPlacesCentre"]["response"]> {
        const sejour = await this.sejourGateway.findBySessionIdAndCentreId(sessionId, centreId);
        if (!sejour) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                "Sejour introuvable pour ce centre et cette session",
            );
        }
        this.logger.warn("sync sejour: " + sejour.id);
        await this.affectationService.syncPlacesDisponiblesSejours([sejour]);
    }
}
