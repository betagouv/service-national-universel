import { RegionAcademiqueRepository } from "../regionAcademique/RegionAcademiqueMongo.repository";
import { RegionAcademiqueGateway } from "@admin/core/referentiel/regionAcademique/RegionAcademique.gateway";

export const referentielGatewayProviders = [
    {
        provide: RegionAcademiqueGateway,
        useClass: RegionAcademiqueRepository,
    },
];
