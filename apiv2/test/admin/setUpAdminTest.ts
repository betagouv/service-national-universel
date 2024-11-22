import configuration from "@config/configuration";
import { getQueueToken } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { QueueName } from "@shared/infra/Queue";
import { NotificationModule } from "@notification/Notification.module";
import { ClsModule } from "nestjs-cls";
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
import { useCaseProvider } from "@admin/infra/sejours/cle/initProvider/useCase";
import { testDatabaseProviders } from "../testDatabaseProvider";
import { QueueModule } from "@infra/Queue.module";

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
        controllers: [ClasseController, AuthController],
        providers: [
            ClasseService,
            ...gatewayProviders,
            ...classeMongoProviders,
            ...referentMongoProviders,
            ...etablissementMongoProviders,
            testDatabaseProviders(setupOptions.newContainer),
            Logger,
            ...guardProviders,
            SigninReferent,
            { provide: AuthProvider, useClass: JwtTokenService },
            ...useCaseProvider,
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
