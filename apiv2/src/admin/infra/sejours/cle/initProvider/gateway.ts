import { ClockGateway } from "@shared/core/Clock.gateway";
import { ClockProvider } from "@shared/infra/Clock.provider";
import { ReferentGateway } from "src/admin/core/iam/Referent.gateway";
import { ReferentAuthGateway } from "src/admin/core/iam/ReferentAuth.gateway";
import { ClasseGateway } from "src/admin/core/sejours/cle/classe/Classe.gateway";
import { EtablissementGateway } from "src/admin/core/sejours/cle/etablissement/Etablissement.gateway";
import { ReferentAuthFacade } from "src/admin/infra/iam/auth/ReferentAuth.facade";
import { ReferentRepository } from "src/admin/infra/iam/repository/mongo/ReferentMongo.repository";
import { ClasseRepository } from "../classe/repository/mongo/ClasseMongo.repository";
import { EtablissementRepository } from "../etablissement/Etablissement.repository";

export const gatewayProviders = [
    {
        provide: ClasseGateway,
        useClass: ClasseRepository,
    },
    { provide: EtablissementGateway, useClass: EtablissementRepository },
    { provide: ReferentAuthGateway, useClass: ReferentAuthFacade },
    { provide: ReferentGateway, useClass: ReferentRepository },
];
