import { RegionAcademiqueGateway } from "@admin/core/referentiel/regionAcademique/RegionAcademique.gateway";
import { RegionAcademiqueMongoRepository } from "../regionAcademique/RegionAcademiqueMongo.repository";

export const referentielGatewayProviders = [
    {
        provide: RegionAcademiqueGateway,
        useClass: RegionAcademiqueMongoRepository,
    },    
];
