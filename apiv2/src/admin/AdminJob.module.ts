import { DatabaseModule } from "@infra/Database.module";
import { Logger, Module } from "@nestjs/common";
import { TaskModule } from "@task/Task.module";
import { taskMongoProviders } from "@task/infra/TaskMongo.provider";
import { AdminTaskConsumer } from "./infra/task/AdminTask.consumer";
import { AdminTaskRepository } from "./infra/task/AdminTaskMongo.repository";
import { jeuneMongoProviders } from "./infra/sejours/jeune/provider/JeuneMongo.provider";
import { centreMongoProviders } from "./infra/sejours/phase1/centre/provider/CentreMongo.provider";
import { ligneDeBusMongoProviders } from "./infra/sejours/phase1/ligneDeBus/provider/LigneDeBusMongo.provider";
import { pointDeRassemblementMongoProviders } from "./infra/sejours/phase1/pointDeRassemblement/provider/PointDeRassemblementMongo.provider";
import { sejourMongoProviders } from "./infra/sejours/phase1/sejour/provider/SejourMongo.provider";
import { sessionMongoProviders } from "./infra/sejours/phase1/session/provider/SessionMongo.provider";
import { SimulationAffectationHTS } from "./core/sejours/phase1/affectation/SimulationAffectationHTS";
import { SimulationAffectationHTSService } from "./core/sejours/phase1/affectation/SimulationAffectationHTS.service";
import { gatewayProviders as phase1GatewayProviders } from "./infra/sejours/phase1/initProvider/gateway";
import { gatewayProviders as jeuneGatewayProviders } from "./infra/sejours/jeune/initProvider/gateway";
import { FileProvider } from "@shared/infra/File.provider";
import { FileGateway } from "@shared/core/File.gateway";
import { ClsModule } from "nestjs-cls";

@Module({
    imports: [ClsModule.forRoot({}), TaskModule, DatabaseModule],
    providers: [
        Logger,
        AdminTaskConsumer,
        AdminTaskRepository,
        ...jeuneMongoProviders,
        ...centreMongoProviders,
        ...ligneDeBusMongoProviders,
        ...pointDeRassemblementMongoProviders,
        ...sejourMongoProviders,
        ...sessionMongoProviders,
        ...taskMongoProviders,
        ...phase1GatewayProviders,
        ...jeuneGatewayProviders,
        { provide: FileGateway, useClass: FileProvider },
        // add use case here
        SimulationAffectationHTSService,
        SimulationAffectationHTS,
    ],
})
export class AdminJobModule {
    constructor(private logger: Logger) {
        this.logger.log("AdminJobModule has started", "AdminJobModule");
    }
}
