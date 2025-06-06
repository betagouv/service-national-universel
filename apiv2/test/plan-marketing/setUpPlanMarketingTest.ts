import configuration from "@config/testConfiguration";
import { getQueueToken } from "@nestjs/bullmq";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ClsModule } from "nestjs-cls";

import { SessionGateway } from "@admin/core/sejours/phase1/session/Session.gateway";
import { sessionMongoProviders } from "@admin/infra/sejours/phase1/session/provider/SessionMongo.provider";
import { SessionRepository } from "@admin/infra/sejours/phase1/session/repository/mongo/SessionMongo.repository";
import { DATABASE_CONNECTION } from "@infra/Database.provider";
import { QueueModule } from "@infra/Queue.module";
import { CampagneGateway } from "@plan-marketing/core/gateway/Campagne.gateway";
import { PlanMarketingGateway } from "@plan-marketing/core/gateway/PlanMarketing.gateway";
import { CampagneService } from "@plan-marketing/core/service/Campagne.service";
import { ProgrammationService } from "@plan-marketing/core/service/Programmation.service";
import { campagneMongoProviders } from "@plan-marketing/infra/CampagneMongo.provider";
import { CampagneMongoRepository } from "@plan-marketing/infra/CampagneMongo.repository";
import { PlanMarketingMockProvider } from "@plan-marketing/infra/provider/PlanMarketingMock.provider";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { ClockProvider } from "@shared/infra/Clock.provider";
import { QueueName } from "@shared/infra/Queue";
import { testDatabaseProviders } from "../testDatabaseProvider";
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
            ...sessionMongoProviders,
            testDatabaseProviders(setupOptions.newContainer),
            { provide: CampagneGateway, useClass: CampagneMongoRepository },
            { provide: PlanMarketingGateway, useClass: PlanMarketingMockProvider },
            { provide: SessionGateway, useClass: SessionRepository },
            ProgrammationService,
            CampagneService,
            { provide: ClockGateway, useClass: ClockProvider },
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
