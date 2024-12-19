import configuration from "@config/testConfiguration";
import { getQueueToken } from "@nestjs/bullmq";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { ClsModule } from "nestjs-cls";

import { QueueName } from "@shared/infra/Queue";

import { NotificationModule } from "@notification/Notification.module";
import { QueueModule } from "@infra/Queue.module";
import { SigninReferent } from "@admin/core/iam/useCase/SigninReferent";
import { ClasseService } from "@admin/core/sejours/cle/classe/Classe.service";
import { AuthController } from "@admin/infra/iam/api/Auth.controller";
import { AuthProvider } from "@admin/infra/iam/auth/Auth.provider";
import { JwtTokenService } from "@admin/infra/iam/auth/JwtToken.service";
import { referentMongoProviders } from "@admin/infra/iam/provider/ReferentMongo.provider";
import { ClasseController } from "@admin/infra/sejours/cle/classe/api/Classe.controller";
import { classeMongoProviders } from "@admin/infra/sejours/cle/classe/provider/ClasseMongo.provider";
import { etablissementMongoProviders } from "@admin/infra/sejours/cle/etablissement/provider/EtablissementMongo.provider";
import { gatewayProviders as cleGatewayProviders } from "@admin/infra/sejours/cle/initProvider/gateway";
import { gatewayProviders as sejourGatewayProviders } from "@admin/infra/sejours/phase1/initProvider/gateway";
import { gatewayProviders as jeuneGatewayProviders } from "@admin/infra/sejours/jeune/initProvider/gateway";
import { guardProviders } from "@admin/infra/sejours/cle/initProvider/guard";
import { useCaseProvider as cleUseCaseProviders } from "@admin/infra/sejours/cle/initProvider/useCase";
import { useCaseProvider as phase1UseCaseProviders } from "@admin/infra/sejours/phase1/initProvider/useCase";
import { testDatabaseProviders } from "../testDatabaseProvider";
import { SimulationAffectationHTSService } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTS.service";
import { AffectationController } from "@admin/infra/sejours/phase1/affectation/api/Affectation.controller";
import { jeuneMongoProviders } from "@admin/infra/sejours/jeune/provider/JeuneMongo.provider";
import { centreMongoProviders } from "@admin/infra/sejours/phase1/centre/provider/CentreMongo.provider";
import { ligneDeBusMongoProviders } from "@admin/infra/sejours/phase1/ligneDeBus/provider/LigneDeBusMongo.provider";
import { pointDeRassemblementMongoProviders } from "@admin/infra/sejours/phase1/pointDeRassemblement/provider/PointDeRassemblementMongo.provider";
import { sejourMongoProviders } from "@admin/infra/sejours/phase1/sejour/provider/SejourMongo.provider";
import { sessionMongoProviders } from "@admin/infra/sejours/phase1/session/provider/SessionMongo.provider";
import { FileProvider } from "@shared/infra/File.provider";
import { FileGateway } from "@shared/core/File.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { AdminTaskRepository } from "@admin/infra/task/AdminTaskMongo.repository";
import { taskMongoProviders } from "@task/infra/TaskMongo.provider";
import { Phase1Controller } from "@admin/infra/sejours/phase1/api/Phase1.controller";
import { ReferentielRoutesService } from "@admin/core/referentiel/routes/ReferentielRoutes.service";
import { serviceProvider } from "@admin/infra/iam/service/serviceProvider";
import { AffectationService } from "@admin/core/sejours/phase1/affectation/Affectation.service";
import { planDeTransportMongoProviders } from "@admin/infra/sejours/phase1/planDeTransport/provider/PlanDeTransportMongo.provider";
import { DATABASE_CONNECTION } from "@infra/Database.provider";

export interface SetupOptions {
    newContainer: boolean;
}

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
        controllers: [ClasseController, AffectationController, Phase1Controller, AuthController],
        providers: [
            ClasseService,
            AffectationService,
            SimulationAffectationHTSService,
            ReferentielRoutesService,
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
            ...sejourMongoProviders,
            ...sessionMongoProviders,
            ...taskMongoProviders,
            // testDatabaseProviders(setupOptions.newContainer),
            Logger,
            ...guardProviders,
            SigninReferent,
            { provide: FileGateway, useClass: FileProvider },
            { provide: AuthProvider, useClass: JwtTokenService },
            { provide: TaskGateway, useClass: AdminTaskRepository },
            ...phase1UseCaseProviders,
            ...cleUseCaseProviders,
            ...serviceProvider,
        ],
    })
        .overrideProvider(getQueueToken(QueueName.EMAIL))
        .useValue(mockQueue)
        .overrideProvider(getQueueToken(QueueName.CONTACT))
        .useValue(mockQueue)
        .overrideProvider(getQueueToken(QueueName.ADMIN_TASK))
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
