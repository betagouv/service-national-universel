import configuration from "@config/configuration";
import { getQueueToken } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { QueueType } from "@notification/infra/Notification";
import { NotificationModule } from "@notification/Notification.module";
import { ClsModule } from "nestjs-cls";
import { SigninReferent } from "src/admin/core/iam/useCase/SigninReferent";
import { ClasseService } from "src/admin/core/sejours/cle/classe/Classe.service";
import { AuthController } from "src/admin/infra/iam/api/Auth.controller";
import { AuthProvider } from "src/admin/infra/iam/auth/Auth.provider";
import { JwtTokenService } from "src/admin/infra/iam/auth/JwtToken.service";
import { referentMongoProviders } from "src/admin/infra/iam/provider/ReferentMongo.provider";
import { ClasseController } from "src/admin/infra/sejours/cle/classe/api/Classe.controller";
import { classeMongoProviders } from "src/admin/infra/sejours/cle/classe/provider/ClasseMongo.provider";
import { etablissementMongoProviders } from "src/admin/infra/sejours/cle/etablissement/provider/EtablissementMongo.provider";
import { gatewayProviders } from "src/admin/infra/sejours/cle/initProvider/gateway";
import { guardProviders } from "src/admin/infra/sejours/cle/initProvider/guard";
import { useCaseProvider } from "src/admin/infra/sejours/cle/initProvider/useCase";
import { testDatabaseProviders } from "../testDatabaseProvider";

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
        .overrideProvider(getQueueToken(QueueType.EMAIL))
        .useValue(mockQueue)
        .overrideProvider(getQueueToken(QueueType.CONTACT))
        .useValue(mockQueue)
        .compile();

    const app = adminTestModule.createNestApplication({ logger: false });

    return { app, adminTestModule };
};

export const getAdminTestModuleRef = () => {
    return adminTestModule;
};
