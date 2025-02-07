import { DatabaseModule } from "@infra/Database.module";
import { Logger, Module } from "@nestjs/common";
import { ClsModule } from "nestjs-cls";
import { ConfigModule } from "@nestjs/config";

import { TaskModule } from "@task/Task.module";
import { taskMongoProviders } from "@task/infra/TaskMongo.provider";
import { AdminTaskConsumer } from "./infra/task/AdminTask.consumer";
import { AdminTaskRepository } from "./infra/task/AdminTaskMongo.repository";
import { classeMongoProviders } from "./infra/sejours/cle/classe/provider/ClasseMongo.provider";
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
import { TaskGateway } from "@task/core/Task.gateway";
import { referentielUseCaseProviders } from "./infra/referentiel/initProvider/useCase";
import { AffectationService } from "./core/sejours/phase1/affectation/Affectation.service";
import { ValiderAffectationHTS } from "./core/sejours/phase1/affectation/ValiderAffectationHTS";
import { planDeTransportMongoProviders } from "./infra/sejours/phase1/planDeTransport/provider/PlanDeTransportMongo.provider";

import { DATABASE_CONNECTION } from "@infra/Database.provider";
import { ClsPluginTransactional } from "@nestjs-cls/transactional";
import { TransactionalAdapterMongoose } from "@infra/TransactionalAdatpterMongoose";
import { historyProvider } from "./infra/history/historyProvider";
import { AdminTaskImportReferentielSelectorService } from "./infra/task/AdminTaskImportReferentielSelector.service";
import { ClasseGateway } from "./core/sejours/cle/classe/Classe.gateway";
import { ClasseRepository } from "./infra/sejours/cle/classe/repository/mongo/ClasseMongo.repository";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { ClockProvider } from "@shared/infra/Clock.provider";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { NotificationProducer } from "@notification/infra/Notification.producer";
import { referentielServiceProvider } from "./infra/referentiel/initProvider/service";
import { ReferentielModule } from "./infra/referentiel/ReferentielModule";
import { segmentDeLigneMongoProviders } from "./infra/sejours/phase1/segmentDeLigne/provider/SegmentDeLigneMongo.provider";
import { demandeModificationLigneDeBusMongoProviders } from "./infra/sejours/phase1/demandeModificationLigneDeBus/provider/DemandeModificationLigneDeBusMongo.provider";
import { SimulationAffectationCLEService } from "./core/sejours/phase1/affectation/SimulationAffectationCLE.service";
import { SimulationAffectationCLE } from "./core/sejours/phase1/affectation/SimulationAffectationCLE";
import { EtablissementGateway } from "./core/sejours/cle/etablissement/Etablissement.gateway";
import { EtablissementRepository } from "./infra/sejours/cle/etablissement/Etablissement.repository";
import { etablissementMongoProviders } from "./infra/sejours/cle/etablissement/provider/EtablissementMongo.provider";
import { ReferentGateway } from "./core/iam/Referent.gateway";
import { ReferentRepository } from "./infra/iam/repository/mongo/ReferentMongo.repository";
import { referentMongoProviders } from "./infra/iam/provider/ReferentMongo.provider";
import { ContactGateway } from "./infra/iam/Contact.gateway";
import { ContactProducer } from "@notification/infra/email/Contact.producer";
import { ValiderAffectationCLE } from "./core/sejours/phase1/affectation/ValiderAffectationCLE";
import { AdminTaskAffectationSelectorService } from "./infra/task/AdminTaskAffectationSelector.service";
import { AdminTaskInscriptionSelectorService } from "./infra/task/AdminTaskInscriptionSelector.service";
import { SimulationBasculeJeunesValides } from "./core/sejours/phase1/inscription/SimulationBasculeJeunesValides";
import { InscriptionService } from "./core/sejours/phase1/inscription/Inscription.service";
import { ValiderBasculeJeunesValides } from "./core/sejours/phase1/inscription/ValiderBasculeJeunesValides";

@Module({
    imports: [
        ClsModule.forRoot({
            plugins: [
                new ClsPluginTransactional({
                    imports: [DatabaseModule],
                    adapter: new TransactionalAdapterMongoose({
                        mongooseConnectionToken: DATABASE_CONNECTION,
                    }),
                }),
            ],
        }),
        ConfigModule,
        TaskModule,
        DatabaseModule,
        ReferentielModule,
    ],
    providers: [
        Logger,
        AdminTaskConsumer,
        AdminTaskRepository,
        ...classeMongoProviders,
        ...etablissementMongoProviders,
        ...referentMongoProviders,
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
        // ...cleGatewayProviders,
        ...phase1GatewayProviders,
        ...jeuneGatewayProviders,
        ...historyProvider,
        { provide: ClasseGateway, useClass: ClasseRepository },
        { provide: ReferentGateway, useClass: ReferentRepository },
        { provide: EtablissementGateway, useClass: EtablissementRepository },
        { provide: ContactGateway, useClass: ContactProducer },
        { provide: NotificationGateway, useClass: NotificationProducer },
        { provide: FileGateway, useClass: FileProvider },
        { provide: TaskGateway, useClass: AdminTaskRepository },
        { provide: ClockGateway, useClass: ClockProvider },
        // add use case here
        AffectationService,
        InscriptionService,
        SimulationAffectationHTSService,
        SimulationAffectationHTS,
        SimulationAffectationCLEService,
        SimulationAffectationCLE,
        ValiderAffectationHTS,
        ValiderAffectationCLE,
        ...referentielUseCaseProviders,
        ...referentielServiceProvider,
        AdminTaskAffectationSelectorService,
        SimulationBasculeJeunesValides,
        ValiderBasculeJeunesValides,
        ...referentielServiceProvider,
        AdminTaskInscriptionSelectorService,
        AdminTaskImportReferentielSelectorService,
    ],
})
export class AdminJobModule {
    constructor(private logger: Logger) {
        this.logger.log("AdminJobModule has started", "AdminJobModule");
    }
}
