import { ClasseType, EtablissementType } from "../../../mongoSchema";
import { ClasseDto, CohortDto, ReferentDto } from "../../../dto";
import { BasicRoute, RouteResponseBody } from "../..";

export interface GetOneClasseRoute extends BasicRoute {
  method: "GET";
  path: "/cle/classe/{id}";
  params: { id: string };
  query?: {
    withDetails?: boolean;
  };
  response: RouteResponseBody<
    ClasseType & {
      etablissement?: Omit<EtablissementType, "referentEtablissementIds" | "coordinateurIds" | "createdAt" | "updatedAt">;
      referents?: Pick<ReferentDto, "firstName" | "lastName" | "role" | "email">[];
      cohesionCenter?: Pick<ClasseDto["cohesionCenter"], "name" | "address" | "zip" | "city" | "department" | "region">;
      session?: Pick<ClasseDto["session"], "_id">;
      pointDeRassemblement?: Pick<ClasseDto["pointDeRassemblement"], "_id" | "name" | "address" | "zip" | "city" | "department" | "region">;
      cohortDetails?: Pick<CohortDto, "dateStart" | "dateEnd">;
    }
  >;
}
