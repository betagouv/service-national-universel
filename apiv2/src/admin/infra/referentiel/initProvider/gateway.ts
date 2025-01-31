import { RegionAcademiqueGateway } from "@admin/core/referentiel/regionAcademique/RegionAcademique.gateway";
import { RegionAcademiqueMongoRepository } from "../regionAcademique/RegionAcademiqueMongo.repository";
import { DepartementGateway,  } from "@admin/core/referentiel/departement/Departement.gateway";
import { DepartementMongoRepository } from "../departement/DepartementMongo.repository";

export const referentielGatewayProviders = [
    {
        provide: RegionAcademiqueGateway,
        useClass: RegionAcademiqueMongoRepository,
    },
    {
        provide: DepartementGateway,
        useClass: DepartementMongoRepository,
    },
];
