import { GetManyEtablissementsRoute } from "./getMany";
import { GetOneEtablissementRoute } from "./getOne";

export type EtablissementsRoutes = {
  GetOne: GetOneEtablissementRoute;
  GetMany: GetManyEtablissementsRoute;
};
