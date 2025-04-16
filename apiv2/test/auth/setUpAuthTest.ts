import configuration from "@config/testConfiguration";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ClsModule } from "nestjs-cls";

import { QueueModule } from "@infra/Queue.module";
import { DATABASE_CONNECTION } from "@infra/Database.provider";
import { testDatabaseProviders } from "../testDatabaseProvider";
import { campagneMongoProviders } from "@plan-marketing/infra/CampagneMongo.provider";
import { PermissionRepository } from "@auth/infra/repository/Permission.repository";
import { PermissionGateway } from "@auth/core/Permission.gateway";
import { RoleRepository } from "@auth/infra/repository/Role.repository";
import { RoleGateway } from "@auth/core/Role.gateway";
import { roleMongoProviders } from "@auth/infra/provider/Role.provider";
import { permissionMongoProviders } from "@auth/infra/provider/Permission.provider";

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

let authTestModule: TestingModule;

export const setUpAuthTest = async (setupOptions: SetupOptions = { newContainer: false }) => {
    authTestModule = await Test.createTestingModule({
        imports: [
            ClsModule.forRoot({}),
            ConfigModule.forRoot({
                load: [configuration],
            }),
            QueueModule,
        ],
        providers: [
            Logger,
            ...campagneMongoProviders,
            testDatabaseProviders(setupOptions.newContainer),
            { provide: RoleGateway, useClass: RoleRepository },
            { provide: PermissionGateway, useClass: PermissionRepository },
            ...roleMongoProviders,
            ...permissionMongoProviders,
        ],
    })
        .overrideProvider(DATABASE_CONNECTION)
        .useFactory({ factory: testDatabaseProviders(setupOptions.newContainer).useFactory })
        .compile();

    const app = authTestModule.createNestApplication({ logger: false });
    app.useGlobalPipes(new ValidationPipe());

    return { app, testModule: authTestModule };
};

export const getAuthTestModuleRef = () => {
    return authTestModule;
};
