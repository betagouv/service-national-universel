import { LigneDeBusGateway } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.gateway";
import { PointDeRassemblementGateway } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.gateway";
import { SejourGateway } from "@admin/core/sejours/phase1/sejour/Sejour.gateway";
import { PointDeRassemblementRepository } from "../pointDeRassemblement/repository/mongo/PointDeRassemblementMongo.repository";
import { LigneDeBusRepository } from "../ligneDeBus/repository/mongo/LigneDeBusMongo.repository";
import { SejourRepository } from "../sejour/repository/mongo/SejourMongo.repository";
import { CentreGateway } from "@admin/core/sejours/phase1/centre/Centre.gateway";
import { CentreRepository } from "../centre/repository/mongo/CentreMongo.repository";
import { SessionGateway } from "@admin/core/sejours/phase1/session/Session.gateway";
import { SessionRepository } from "../session/repository/mongo/SessionMongo.repository";
import { PlanDeTransportGateway } from "@admin/core/sejours/phase1/PlanDeTransport/PlanDeTransport.gateway";
import { PlanDeTransportRepository } from "../planDeTransport/repository/mongo/PlanDeTransportMongo.repository";
import { SegmentDeLigneGateway } from "@admin/core/sejours/phase1/segmentDeLigne/SegmentDeLigne.gateway";
import { SegmentDeLigneRepository } from "../segmentDeLigne/repository/mongo/SegmentDeLigneMongo.repository";
import { DemandeModificationLigneDeBusGateway } from "@admin/core/sejours/phase1/demandeModificationLigneDeBus/DemandeModificationLigneDeBus.gateway";
import { DemandeModificationLigneDeBusRepository } from "../demandeModificationLigneDeBus/repository/mongo/DemandeModificationLigneDeBusMongo.repository";

export const gatewayProviders = [
    { provide: PlanDeTransportGateway, useClass: PlanDeTransportRepository },
    { provide: LigneDeBusGateway, useClass: LigneDeBusRepository },
    { provide: PointDeRassemblementGateway, useClass: PointDeRassemblementRepository },
    { provide: SegmentDeLigneGateway, useClass: SegmentDeLigneRepository },
    { provide: DemandeModificationLigneDeBusGateway, useClass: DemandeModificationLigneDeBusRepository },
    { provide: SejourGateway, useClass: SejourRepository },
    { provide: CentreGateway, useClass: CentreRepository },
    { provide: SessionGateway, useClass: SessionRepository },
];
