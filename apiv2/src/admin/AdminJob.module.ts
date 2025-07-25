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
import { SimulationBasculeJeunes } from "./core/sejours/phase1/inscription/SimulationBasculeJeunes";
import { InscriptionService } from "./core/sejours/phase1/inscription/Inscription.service";
import { ValiderBasculeJeunesValides } from "./core/sejours/phase1/inscription/ValiderBasculeJeunesValides";
import { SimulationAffectationCLEDromCom } from "./core/sejours/phase1/affectation/SimulationAffectationCLEDromCom";
import { ValiderAffectationCLEDromCom } from "./core/sejours/phase1/affectation/ValiderAffectationCLEDromCom";
import { ValiderAffectationCLEService } from "./core/sejours/phase1/affectation/ValiderAffectationCLE.service";
import { ValiderBasculeJeunesService } from "./core/sejours/phase1/inscription/ValiderBasculeJeunes.service";
import { ValiderBasculeJeunesNonValides } from "./core/sejours/phase1/inscription/ValiderBasculeJeunesNonValides";
import { ValiderDesisterPostAffectation } from "./core/sejours/phase1/desistement/ValiderDesisterPostAffectation";
import { DesistementService } from "./core/sejours/phase1/desistement/Desistement.service";
import { SimulationAffectationHTSDromCom } from "./core/sejours/phase1/affectation/SimulationAffectationHTSDromCom";
import { ValiderAffectationHTSService } from "./core/sejours/phase1/affectation/ValiderAffectationHTS.service";
import { ValiderAffectationHTSDromCom } from "./core/sejours/phase1/affectation/ValiderAffectationHTSDromCom";
import { SimulationDesisterPostAffectation } from "./core/sejours/phase1/desistement/SimulationDesisterPostAffectation";
import { ImporterClasseEnMasse } from "./core/sejours/cle/classe/importEnMasse/useCase/ImporterClasseEnMasse";
import { ClasseService } from "./core/sejours/cle/classe/Classe.service";
import { JeuneService } from "./core/sejours/jeune/Jeune.service";
import { AuthModule } from "@auth/Auth.module";
import { AdminTaskEngagementSelectorService } from "./infra/task/AdminTaskEngagementSelector";
import { ExporterMissionCanditatures } from "./core/engagement/mission/ExporterMissionCanditatures";
import { ExporterMissions } from "./core/engagement/mission/ExporterMissions";
import { SearchMissionGateway } from "@analytics/core/SearchMission.gateway";
import { SearchMissionElasticRepository } from "@analytics/infra/SearchMissionElastic.repository";
import { AnalyticsModule } from "@analytics/analytics.module";
import { SearchApplicationGateway } from "@analytics/core/SearchApplication.gateway";
import { SearchApplicationElasticRepository } from "@analytics/infra/SearchApplicationElastic.repository";
import { SearchYoungGateway } from "@analytics/core/SearchYoung.gateway";
import { SearchYoungElasticRepository } from "@analytics/infra/SearchYoungElastic.repository";
import { SearchReferentGateway } from "@analytics/core/SearchReferent.gateway";
import { SearchStructureGateway } from "@analytics/core/SearchStructure.gateway";
import { SearchReferentElasticRepository } from "@analytics/infra/SearchReferentElastic.repository";
import { SearchStructureElasticRepository } from "@analytics/infra/SearchStructureElastic.repository";
import { structureMongoProviders } from "./infra/engagement/structure/provider/StructureMongo.provider";
import { StructureGateway } from "./core/engagement/structure/Structure.gateway";
import { StructureRepository } from "./infra/engagement/structure/repository/mongo/StructureMongo.repository";
import { ExportMissionService } from "./core/engagement/mission/ExportMission.service";
import { SharedModule } from "@shared/Shared.module";
import { ExporterJeunes } from "./core/sejours/phase1/jeune/ExporterJeunes";
import { CandidatureGateway } from "./core/engagement/candidature/Candidature.gateway";
import { CandidatureRepository } from "./infra/engagement/candidature/repository/mongo/CandidatureMongo.repository";
import { candidatureMongoProviders } from "./infra/engagement/candidature/provider/CandidatureMongo.provider";
import { NettoyageExportMissions } from "./core/engagement/mission/cron/NettoyageExportMissions";
import { NettoyageExportJeune } from "./core/sejours/phase1/jeune/cron/NettoyageExportJeune";
import { ExporterJeuneService } from "./core/sejours/phase1/jeune/ExporterJeune.service";
import { SearchLigneDeBusGateway } from "@analytics/core/SearchLigneDeBus.gateway";
import { SearchSegmentDeLigneGateway } from "@analytics/core/SearchSegmentDeLigne.gateway";
import { SearchEtablissementGateway } from "@analytics/core/SearchEtablissement.gateway";
import { SearchClasseGateway } from "@analytics/core/SearchClasse.gateway";
import { SearchCentreGateway } from "@analytics/core/SearchCentre.gateway";
import { SearchSejourGateway } from "@analytics/core/SearchSejour.gateway";
import { SearchPointDeRassemblementGateway } from "@analytics/core/SearchPointDeRassemblement.gateway";
import { SearchSchoolGateway } from "@analytics/core/SearchSchool.gateway";
import { SearchCentreElasticRepository } from "@analytics/infra/SearchCentreElastic.repository";
import { SearchClasseElasticRepository } from "@analytics/infra/SearchClasseElastic.repository";
import { SearchEtablissementElasticRepository } from "@analytics/infra/SearchEtablissementElastic.repository";
import { SearchLigneDeBusElasticRepository } from "@analytics/infra/SearchLigneDeBusElastic.repository";
import { SearchPointDeRassemblementElasticRepository } from "@analytics/infra/SearchPointDeRassemblementElastic.repository";
import { SearchSchoolElasticRepository } from "@analytics/infra/SearchSchoolElastic.repository";
import { SearchSegmentDeLigneElasticRepository } from "@analytics/infra/SearchSegmentDeLigneElastic.repository";
import { SearchSejourElasticRepository } from "@analytics/infra/SearchSejourElastic.repository";

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
        AuthModule,
        AnalyticsModule,
        SharedModule,
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
        ...historyProvider,
        ...structureMongoProviders,
        ...candidatureMongoProviders,
        // ...cleGatewayProviders,
        ...phase1GatewayProviders,
        ...jeuneGatewayProviders,
        { provide: ClasseGateway, useClass: ClasseRepository },
        { provide: ReferentGateway, useClass: ReferentRepository },
        { provide: EtablissementGateway, useClass: EtablissementRepository },
        { provide: ContactGateway, useClass: ContactProducer },
        { provide: NotificationGateway, useClass: NotificationProducer },
        { provide: FileGateway, useClass: FileProvider },
        { provide: TaskGateway, useClass: AdminTaskRepository },
        { provide: ClockGateway, useClass: ClockProvider },
        { provide: StructureGateway, useClass: StructureRepository },
        { provide: CandidatureGateway, useClass: CandidatureRepository },
        { provide: SearchYoungGateway, useClass: SearchYoungElasticRepository },
        { provide: SearchMissionGateway, useClass: SearchMissionElasticRepository },
        { provide: SearchApplicationGateway, useClass: SearchApplicationElasticRepository },
        { provide: SearchReferentGateway, useClass: SearchReferentElasticRepository },
        { provide: SearchStructureGateway, useClass: SearchStructureElasticRepository },
        { provide: SearchCentreGateway, useClass: SearchCentreElasticRepository },
        { provide: SearchClasseGateway, useClass: SearchClasseElasticRepository },
        { provide: SearchEtablissementGateway, useClass: SearchEtablissementElasticRepository },
        { provide: SearchLigneDeBusGateway, useClass: SearchLigneDeBusElasticRepository },
        { provide: SearchPointDeRassemblementGateway, useClass: SearchPointDeRassemblementElasticRepository },
        { provide: SearchSchoolGateway, useClass: SearchSchoolElasticRepository },
        { provide: SearchSegmentDeLigneGateway, useClass: SearchSegmentDeLigneElasticRepository },
        { provide: SearchSejourGateway, useClass: SearchSejourElasticRepository },
        // add use case here
        AffectationService,
        InscriptionService,
        SimulationAffectationHTSService,
        SimulationAffectationHTS,
        SimulationAffectationHTSDromCom,
        SimulationAffectationCLEService,
        SimulationAffectationCLE,
        SimulationAffectationCLEDromCom,
        ValiderAffectationHTSService,
        ValiderAffectationCLEService,
        ValiderAffectationHTS,
        ValiderAffectationHTSDromCom,
        ValiderAffectationCLE,
        ValiderAffectationCLEDromCom,
        SimulationDesisterPostAffectation,
        ValiderDesisterPostAffectation,
        DesistementService,
        ...referentielUseCaseProviders,
        ...referentielServiceProvider,
        AdminTaskAffectationSelectorService,
        SimulationBasculeJeunes,
        ValiderBasculeJeunesService,
        ValiderBasculeJeunesValides,
        ValiderBasculeJeunesNonValides,
        ExporterJeunes,
        ExporterMissionCanditatures,
        ExporterMissions,
        NettoyageExportMissions,
        NettoyageExportJeune,
        ...referentielServiceProvider,
        AdminTaskInscriptionSelectorService,
        AdminTaskImportReferentielSelectorService,
        AdminTaskEngagementSelectorService,
        ImporterClasseEnMasse,
        ClasseService,
        JeuneService,
        ExportMissionService,
        ExporterJeuneService,
    ],
    exports: [NettoyageExportMissions, NettoyageExportJeune],
})
export class AdminJobModule {
    constructor(private logger: Logger) {
        this.logger.log("AdminJobModule has started", "AdminJobModule");
    }
}
