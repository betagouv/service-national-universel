import { Logger, Module } from "@nestjs/common";
import { ImportReferentielController } from "./api/ImportReferentiel.controller";
import { referentielGatewayProviders } from "./initProvider/gateway";
import { referentielUseCaseProviders } from "./initProvider/useCase";
import { TaskGateway } from "@task/core/Task.gateway";
import { taskMongoProviders } from "@task/infra/TaskMongo.provider";
import { FileProvider } from "@shared/infra/File.provider";
import { FileGateway } from "@shared/core/File.gateway";
import { regionAcademiqueMongoProviders } from "./regionAcademique/RegionAcademiqueMongo.provider";
import { ImporterRoutes } from "@admin/core/referentiel/routes/useCase/ImporterRoutes";
import { DatabaseModule } from "@infra/Database.module";
import { ConfigModule } from "@nestjs/config";
import { AdminTaskRepository } from "../task/AdminTaskMongo.repository";
import { referentielServiceProvider } from "./initProvider/service";
import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { ClasseRepository } from "../sejours/cle/classe/repository/mongo/ClasseMongo.repository";
import { SessionGateway } from "@admin/core/sejours/phase1/session/Session.gateway";
import { SessionRepository } from "../sejours/phase1/session/repository/mongo/SessionMongo.repository";
import { sessionMongoProviders } from "../sejours/phase1/session/provider/SessionMongo.provider";
import { LigneDeBusGateway } from "../../core/sejours/phase1/ligneDeBus/LigneDeBus.gateway";
import { LigneDeBusRepository } from "../sejours/phase1/ligneDeBus/repository/mongo/LigneDeBusMongo.repository";
import { ligneDeBusMongoProviders } from "../sejours/phase1/ligneDeBus/provider/LigneDeBusMongo.provider";
import { PlanDeTransportGateway } from "@admin/core/sejours/phase1/PlanDeTransport/PlanDeTransport.gateway";
import { PlanDeTransportRepository } from "../sejours/phase1/planDeTransport/repository/mongo/PlanDeTransportMongo.repository";
import { planDeTransportMongoProviders } from "../sejours/phase1/planDeTransport/provider/PlanDeTransportMongo.provider";
import { CentreGateway } from "@admin/core/sejours/phase1/centre/Centre.gateway";
import { CentreRepository } from "../sejours/phase1/centre/repository/mongo/CentreMongo.repository";
import { PointDeRassemblementRepository } from "../sejours/phase1/pointDeRassemblement/repository/mongo/PointDeRassemblementMongo.repository";
import { PointDeRassemblementGateway } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.gateway";
import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { JeuneRepository } from "../sejours/jeune/repository/mongo/JeuneMongo.repository";
import { SejourGateway } from "@admin/core/sejours/phase1/sejour/Sejour.gateway";
import { SejourRepository } from "../sejours/phase1/sejour/repository/mongo/SejourMongo.repository";
import { HistoryGateway } from "@admin/core/history/History.gateway";
import { HistoryRepository } from "../history/repository/mongo/HistoryMongo.repository";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { NotificationProducer } from "@notification/infra/Notification.producer";
import { classeMongoProviders } from "../sejours/cle/classe/provider/ClasseMongo.provider";
import { ClsModule } from "nestjs-cls";
import { centreMongoProviders } from "../sejours/phase1/centre/provider/CentreMongo.provider";
import { pointDeRassemblementMongoProviders } from "../sejours/phase1/pointDeRassemblement/provider/PointDeRassemblementMongo.provider";
import { jeuneMongoProviders } from "../sejours/jeune/provider/JeuneMongo.provider";
import { sejourMongoProviders } from "../sejours/phase1/sejour/provider/SejourMongo.provider";
import { historyMongoProviders } from "../history/repository/mongo/HistoryMongo.provider";
import { ImporterRegionsAcademiques } from "@admin/core/referentiel/regionAcademique/useCase/ImporterRegionsAcademiques/ImporterRegionsAcademiques";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { ClockProvider } from "@shared/infra/Clock.provider";
import { departementMongoProviders } from "./departement/DepartementMongo.provider";
import { ImporterDepartements } from "@admin/core/referentiel/departement/useCase/ImporterDepartements/ImporterDepartements";
import { ImporterAcademies } from "@admin/core/referentiel/academie/useCase/ImporterAcademies/ImporterAcademies";
import { academieMongoProviders } from "./academie/Academie.provider";
import { DesistementService } from "@admin/core/sejours/phase1/desistement/Desistement.service";
import { AffectationService } from "@admin/core/sejours/phase1/affectation/Affectation.service";

@Module({
    imports: [DatabaseModule, ConfigModule, ClsModule],
    controllers: [ImportReferentielController],
    providers: [
        ...taskMongoProviders,
        { provide: TaskGateway, useClass: AdminTaskRepository },
        { provide: FileGateway, useClass: FileProvider },
        { provide: ClockGateway, useClass: ClockProvider },
        ...referentielGatewayProviders,
        ...referentielUseCaseProviders,
        ...regionAcademiqueMongoProviders,
        ...departementMongoProviders,
        ...academieMongoProviders,
        ...referentielServiceProvider,
        { provide: SessionGateway, useClass: SessionRepository },
        { provide: CentreGateway, useClass: CentreRepository },
        { provide: PointDeRassemblementGateway, useClass: PointDeRassemblementRepository },
        { provide: JeuneGateway, useClass: JeuneRepository },
        { provide: SejourGateway, useClass: SejourRepository },
        { provide: HistoryGateway, useClass: HistoryRepository },
        { provide: NotificationGateway, useClass: NotificationProducer },
        { provide: ClasseGateway, useClass: ClasseRepository },
        { provide: LigneDeBusGateway, useClass: LigneDeBusRepository },
        { provide: PlanDeTransportGateway, useClass: PlanDeTransportRepository },
        ...classeMongoProviders,
        ...sessionMongoProviders,
        ...ligneDeBusMongoProviders,
        ...planDeTransportMongoProviders,
        ...centreMongoProviders,
        ...pointDeRassemblementMongoProviders,
        ...jeuneMongoProviders,
        ...sejourMongoProviders,
        ...historyMongoProviders,
        DesistementService,
        AffectationService,
        Logger,
    ],
    exports: [
        ImporterRegionsAcademiques,
        ImporterRoutes,
        ImporterDepartements,
        ImporterAcademies,
        ...referentielServiceProvider,
        ...referentielGatewayProviders,
    ],
})
export class ReferentielModule {}
