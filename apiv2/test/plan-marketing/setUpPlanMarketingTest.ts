import configuration from "@config/testConfiguration";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ClsModule } from "nestjs-cls";
import { getQueueToken } from "@nestjs/bullmq";

import { QueueModule } from "@infra/Queue.module";
import { QueueName } from "@shared/infra/Queue";
import { DATABASE_CONNECTION } from "@infra/Database.provider";
import { testDatabaseProviders } from "../testDatabaseProvider";
import { CampagneGateway } from "@plan-marketing/core/gateway/Campagne.gateway";
import { CampagneMongoRepository } from "@plan-marketing/infra/CampagneMongo.repository";
import { campagneMongoProviders } from "@plan-marketing/infra/CampagneMongo.provider";

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

let planMarketingTestModule: TestingModule;

export const setUpPlanMarketingTest = async (setupOptions: SetupOptions = { newContainer: false }) => {
    const mockQueue: any = {
        add: jest.fn(),
    };

    planMarketingTestModule = await Test.createTestingModule({
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
            { provide: CampagneGateway, useClass: CampagneMongoRepository },
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

    const app = planMarketingTestModule.createNestApplication({ logger: false });
    app.useGlobalPipes(new ValidationPipe());

    return { app, testModule: planMarketingTestModule };
};

export const getPlanMarketingTestModuleRef = () => {
    return planMarketingTestModule;
};
