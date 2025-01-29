import { GetBasculerJeunesValidesRoute } from "./getBasculerJeunesValidesRoute";
import { PostBasculerJeunesValidesRoute } from "./postBasculerJeunesValidesRoute";
import { PostValiderBasculerJeunesValidesRoute } from "./postValiderBasculerJeunesValidesRoute";

export type InscriptionRoutes = {
  GetBasculerJeunesValides: GetBasculerJeunesValidesRoute;
  PostBasculerJeunesValides: PostBasculerJeunesValidesRoute;
  PostValiderBasculerJeunesValides: PostValiderBasculerJeunesValidesRoute;
};
