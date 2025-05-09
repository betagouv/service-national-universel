import configuration from "@config/testConfiguration";
import { getQueueToken } from "@nestjs/bullmq";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { ClsModule } from "nestjs-cls";

import { QueueName } from "@shared/infra/Queue";

import { SigninReferent } from "@admin/core/iam/useCase/SigninReferent";
import { ClasseService } from "@admin/core/sejours/cle/classe/Classe.service";
import { AffectationService } from "@admin/core/sejours/phase1/affectation/Affectation.service";
import { SimulationAffectationCLEService } from "@admin/core/sejours/phase1/affectation/SimulationAffectationCLE.service";
import { SimulationAffectationHTSService } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTS.service";
import { InscriptionService } from "@admin/core/sejours/phase1/inscription/Inscription.service";
import { ValiderBasculeJeunesService } from "@admin/core/sejours/phase1/inscription/ValiderBasculeJeunes.service";
import { historyProvider } from "@admin/infra/history/historyProvider";
import { AuthController } from "@admin/infra/iam/api/Auth.controller";
import { AuthProvider } from "@admin/infra/iam/auth/Auth.provider";
import { JwtTokenService } from "@admin/infra/iam/auth/JwtToken.service";
import { referentMongoProviders } from "@admin/infra/iam/provider/ReferentMongo.provider";
import { serviceProvider } from "@admin/infra/iam/service/serviceProvider";
import { academieMongoProviders } from "@admin/infra/referentiel/academie/Academie.provider";
import { departementMongoProviders } from "@admin/infra/referentiel/departement/DepartementMongo.provider";
import { referentielGatewayProviders } from "@admin/infra/referentiel/initProvider/gateway";
import { regionAcademiqueMongoProviders } from "@admin/infra/referentiel/regionAcademique/RegionAcademiqueMongo.provider";
import { ClasseController } from "@admin/infra/sejours/cle/classe/api/Classe.controller";
import { classeMongoProviders } from "@admin/infra/sejours/cle/classe/provider/ClasseMongo.provider";
import { etablissementMongoProviders } from "@admin/infra/sejours/cle/etablissement/provider/EtablissementMongo.provider";
import { gatewayProviders as cleGatewayProviders } from "@admin/infra/sejours/cle/initProvider/gateway";
import { guardProviders } from "@admin/infra/sejours/cle/initProvider/guard";
import { useCaseProvider as cleUseCaseProviders } from "@admin/infra/sejours/cle/initProvider/useCase";
import { gatewayProviders as jeuneGatewayProviders } from "@admin/infra/sejours/jeune/initProvider/gateway";
import { jeuneMongoProviders } from "@admin/infra/sejours/jeune/provider/JeuneMongo.provider";
import { AffectationController } from "@admin/infra/sejours/phase1/affectation/api/Affectation.controller";
import { Phase1Controller } from "@admin/infra/sejours/phase1/api/Phase1.controller";
import { centreMongoProviders } from "@admin/infra/sejours/phase1/centre/provider/CentreMongo.provider";
import { demandeModificationLigneDeBusMongoProviders } from "@admin/infra/sejours/phase1/demandeModificationLigneDeBus/provider/DemandeModificationLigneDeBusMongo.provider";
import { gatewayProviders as sejourGatewayProviders } from "@admin/infra/sejours/phase1/initProvider/gateway";
import { useCaseProvider as phase1UseCaseProviders } from "@admin/infra/sejours/phase1/initProvider/useCase";
import { BasculeJeuneNonValidesController } from "@admin/infra/sejours/phase1/inscription/api/BasculeJeuneNonValides.controller";
import { BasculeJeuneValidesController } from "@admin/infra/sejours/phase1/inscription/api/BasculeJeuneValides.controller";
import { ligneDeBusMongoProviders } from "@admin/infra/sejours/phase1/ligneDeBus/provider/LigneDeBusMongo.provider";
import { planDeTransportMongoProviders } from "@admin/infra/sejours/phase1/planDeTransport/provider/PlanDeTransportMongo.provider";
import { pointDeRassemblementMongoProviders } from "@admin/infra/sejours/phase1/pointDeRassemblement/provider/PointDeRassemblementMongo.provider";
import { segmentDeLigneMongoProviders } from "@admin/infra/sejours/phase1/segmentDeLigne/provider/SegmentDeLigneMongo.provider";
import { sejourMongoProviders } from "@admin/infra/sejours/phase1/sejour/provider/SejourMongo.provider";
import { sessionMongoProviders } from "@admin/infra/sejours/phase1/session/provider/SessionMongo.provider";
import { AdminTaskRepository } from "@admin/infra/task/AdminTaskMongo.repository";
import { DATABASE_CONNECTION } from "@infra/Database.provider";
import { QueueModule } from "@infra/Queue.module";
import { NotificationModule } from "@notification/Notification.module";
import { FileGateway } from "@shared/core/File.gateway";
import { FileProvider } from "@shared/infra/File.provider";
import { TaskGateway } from "@task/core/Task.gateway";
import { taskMongoProviders } from "@task/infra/TaskMongo.provider";
import { testDatabaseProviders } from "../testDatabaseProvider";
import { Phase1Service } from "@admin/core/sejours/phase1/Phase1.service";
import { DesistementController } from "@admin/infra/sejours/phase1/desistement/api/Desistement.controller";
import { DesistementService } from "../../src/admin/core/sejours/phase1/desistement/Desistement.service";
export interface SetupOptions {
    newContainer: boolean;
}

jest.mock("@nestjs-cls/transactional", () => ({
    Transactional: () => jest.fn(),
}));

jest.mock("@bull-board/nestjs", () => ({
    BullBoardModule: {
        forRootAsync: () => ({
            module: class BullBoardModule {},
        }),
        forFeature: () => ({
            module: class BullBoardFeatureModule {},
        }),
    },
}));

let adminTestModule: TestingModule;
export const setupAdminTest = async (setupOptions: SetupOptions = { newContainer: false }) => {
    const mockQueue: any = {
        add: jest.fn(),
        // process: jest.fn(), // Used by job queue consumer
    };
    adminTestModule = await Test.createTestingModule({
        imports: [
            ClsModule.forRoot({}),
            ConfigModule.forRoot({
                load: [configuration],
            }),
            NotificationModule,
            JwtModule.register({
                secret: "your-secret-key",
                signOptions: { expiresIn: "1h" },
            }),
            QueueModule,
        ],
        controllers: [
            ClasseController,
            AffectationController,
            BasculeJeuneValidesController,
            BasculeJeuneNonValidesController,
            DesistementController,
            Phase1Controller,
            AuthController,
        ],
        providers: [
            ClasseService,
            Phase1Service,
            AffectationService,
            InscriptionService,
            SimulationAffectationHTSService,
            SimulationAffectationCLEService,
            ValiderBasculeJeunesService,
            DesistementService,
            ...cleGatewayProviders,
            ...sejourGatewayProviders,
            ...jeuneGatewayProviders,
            ...classeMongoProviders,
            ...referentMongoProviders,
            ...etablissementMongoProviders,
            ...jeuneMongoProviders,
            ...centreMongoProviders,
            ...planDeTransportMongoProviders,
            ...ligneDeBusMongoProviders,
            ...pointDeRassemblementMongoProviders,
            ...segmentDeLigneMongoProviders,
            ...demandeModificationLigneDeBusMongoProviders,
            ...sejourMongoProviders,
            ...sessionMongoProviders,
            ...taskMongoProviders,
            ...historyProvider,
            testDatabaseProviders(setupOptions.newContainer),
            Logger,
            ...guardProviders,
            SigninReferent,
            { provide: FileGateway, useClass: FileProvider },
            { provide: AuthProvider, useClass: JwtTokenService },
            { provide: TaskGateway, useClass: AdminTaskRepository },
            ...phase1UseCaseProviders,
            ...cleUseCaseProviders,
            ...referentielGatewayProviders,
            ...regionAcademiqueMongoProviders,
            ...serviceProvider,
            ...academieMongoProviders,
            ...departementMongoProviders,
        ],
    })
        .overrideProvider(getQueueToken(QueueName.EMAIL))
        .useValue(mockQueue)
        .overrideProvider(getQueueToken(QueueName.CONTACT))
        .useValue(mockQueue)
        .overrideProvider(getQueueToken(QueueName.ADMIN_TASK))
        .useValue(mockQueue)
        .overrideProvider(getQueueToken(QueueName.CRON))
        .useValue(mockQueue)
        .overrideProvider(DATABASE_CONNECTION)
        .useFactory({ factory: testDatabaseProviders(setupOptions.newContainer).useFactory })
        .compile();

    const app = adminTestModule.createNestApplication({ logger: false });
    app.useGlobalPipes(new ValidationPipe());

    return { app, adminTestModule };
};

export const getAdminTestModuleRef = () => {
    return adminTestModule;
};
