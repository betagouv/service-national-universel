import { JeuneGateway } from "@admin/core/sejours/jeune/Jeune.gateway";
import { JeuneRepository } from "../repository/mongo/JeuneMongo.repository";

export const gatewayProviders = [
    {
        provide: JeuneGateway,
        useClass: JeuneRepository,
    },
];
