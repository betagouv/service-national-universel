import { LigneDeBusGateway } from "src/admin/core/sejours/phase1/ligneDeBus/LigneDeBus.gateway";
import { PointDeRassemblementGateway } from "src/admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.gateway";
import { SejourGateway } from "src/admin/core/sejours/phase1/sejour/Sejour.gateway";
import { PointDeRassemblementRepository } from "../pointDeRassemblement/repository/mongo/PointDeRassemblementMongo.repository";
import { LigneDeBusRepository } from "../ligneDeBus/repository/mongo/LigneDeBusMongo.repository";
import { SejourRepository } from "../sejour/repository/mongo/SejourMongo.repository";
import { CentreGateway } from "src/admin/core/sejours/phase1/centre/Centre.gateway";
import { CentreRepository } from "../centre/repository/mongo/CentreMongo.repository";

export const gatewayProviders = [
    { provide: LigneDeBusGateway, useClass: LigneDeBusRepository },
    { provide: PointDeRassemblementGateway, useClass: PointDeRassemblementRepository },
    { provide: SejourGateway, useClass: SejourRepository },
    { provide: CentreGateway, useClass: CentreRepository },
];
