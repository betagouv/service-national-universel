import configuration from "@config/testConfiguration";
import { getQueueToken } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
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
import { gatewayProviders } from "@admin/infra/sejours/cle/initProvider/gateway";
import { guardProviders } from "@admin/infra/sejours/cle/initProvider/guard";
import { useCaseProvider as cleUseCaseProviders } from "@admin/infra/sejours/cle/initProvider/useCase";
import { useCaseProvider as phase1UseCaseProviders } from "@admin/infra/sejours/phase1/initProvider/useCase";
import { testDatabaseProviders } from "../testDatabaseProvider";
import { SimulationAffectationHTSService } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTS.service";
import { AffectationController } from "@admin/infra/sejours/phase1/affectation/api/Affectation.controller";
import { jeuneMongoProviders } from "@admin/infra/sejours/jeune/provider/JeuneMongo.provider";
import { centreMongoProviders } from "@admin/infra/sejours/phase1/centre/provider/CentreMongo.provider";
import { LigneDeBusMongoProviders } from "@admin/infra/sejours/phase1/ligneDeBus/provider/LigneDeBusMongo.provider";
import { pointDeRassemblementMongoProviders } from "@admin/infra/sejours/phase1/pointDeRassemblement/provider/PointDeRassemblementMongo.provider";
import { sejourMongoProviders } from "@admin/infra/sejours/phase1/sejour/provider/SejourMongo.provider";

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
        controllers: [ClasseController, AffectationController, AuthController],
        providers: [
            ClasseService,
            SimulationAffectationHTSService,
            ...gatewayProviders,
            ...classeMongoProviders,
            ...referentMongoProviders,
            ...etablissementMongoProviders,
            ...jeuneMongoProviders,
            ...centreMongoProviders,
            ...LigneDeBusMongoProviders,
            ...pointDeRassemblementMongoProviders,
            ...sejourMongoProviders,
            testDatabaseProviders(setupOptions.newContainer),
            Logger,
            ...guardProviders,
            SigninReferent,
            { provide: AuthProvider, useClass: JwtTokenService },
            ...phase1UseCaseProviders,
            ...cleUseCaseProviders,
        ],
    })
        .overrideProvider(getQueueToken(QueueName.EMAIL))
        .useValue(mockQueue)
        .overrideProvider(getQueueToken(QueueName.CONTACT))
        .useValue(mockQueue)
        .overrideProvider(getQueueToken(QueueName.ADMIN_TASK))
        .useValue(mockQueue)
        .compile();

    const app = adminTestModule.createNestApplication({ logger: false });

    return { app, adminTestModule };
};

export const getAdminTestModuleRef = () => {
    return adminTestModule;
};
