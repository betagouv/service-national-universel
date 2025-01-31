import { RegionAcademiqueGateway } from "@admin/core/referentiel/regionAcademique/RegionAcademique.gateway";
import { RegionAcademiqueMongoRepository } from "../regionAcademique/RegionAcademiqueMongo.repository";
import { DepartementGateway,  } from "@admin/core/referentiel/departement/Departement.gateway";
import { DepartementMongoRepository } from "../departement/DepartementMongo.repository";
import { AcademieGateway } from "@admin/core/referentiel/academie/Academie.gateway";
import { AcademieMongoRepository } from "../academie/AcademieMongo.repository";

export const referentielGatewayProviders = [
    {
        provide: RegionAcademiqueGateway,
        useClass: RegionAcademiqueMongoRepository,
    },
    {
        provide: DepartementGateway,
        useClass: DepartementMongoRepository,
    },
    {
        provide: AcademieGateway,
        useClass: AcademieMongoRepository,
    },
];