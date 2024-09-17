import { ClasseType, CohesionCenterType, CohortType, EtablissementType, ReferentType, PointDeRassemblementType } from "../../../mongoSchema";
import { ClasseDto } from "../../../dto";
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
      referents?: Pick<ReferentType, "_id" | "firstName" | "lastName" | "role" | "email">[];
      cohesionCenter?: Pick<CohesionCenterType, "_id" | "name" | "address" | "zip" | "city" | "department" | "region">;
      session?: Pick<ClasseDto["session"], "_id">;
      pointDeRassemblement?: Pick<PointDeRassemblementType, "_id" | "name" | "address" | "zip" | "city" | "department" | "region">;
      cohortDetails?: Pick<CohortType, "_id" | "dateStart" | "dateEnd">;
    }
  >;
}
