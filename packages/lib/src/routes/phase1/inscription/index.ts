import { GetBasculeJeunesValidesRoute } from "./getBasculeJeunesValidesRoute";
import { PostBasculeJeunesValidesRoute } from "./postBasculeJeunesValidesRoute";
import { PostValiderBasculeJeunesValidesRoute } from "./postValiderBasculeJeunesValidesRoute";

export type InscriptionRoutes = {
  GetBasculeJeunesValides: GetBasculeJeunesValidesRoute;
  PostBasculeJeunesValides: PostBasculeJeunesValidesRoute;
  PostValiderBasculeJeunesValides: PostValiderBasculeJeunesValidesRoute;
};
