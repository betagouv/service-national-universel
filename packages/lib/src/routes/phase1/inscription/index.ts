import { GetBasculeJeunesNonValidesRoute } from "./getBasculeJeunesNonValidesRoute";
import { GetBasculeJeunesValidesRoute } from "./getBasculeJeunesValidesRoute";
import { PostBasculeJeunesNonValidesRoute } from "./postBasculeJeunesNonValidesRoute";
import { PostBasculeJeunesValidesRoute } from "./postBasculeJeunesValidesRoute";
import { PostInscriptionsExportRoute } from "./postInscriptionsExportRoute";
import { PostInscriptionsScolariseExportRoute } from "./postInscriptionsScolariseExportRoute";
import { PostValiderBasculeJeunesValidesRoute } from "./postValiderBasculeJeunesValidesRoute";
import { PostValiderBasculeJeunesNonValidesRoute } from "./postValiderBasculeNonJeunesValidesRoute";

export type InscriptionRoutes = {
  GetBasculeJeunesValides: GetBasculeJeunesValidesRoute;
  GetBasculeJeunesNonValides: GetBasculeJeunesNonValidesRoute;
  PostBasculeJeunesValides: PostBasculeJeunesValidesRoute;
  PostBasculeJeunesNonValides: PostBasculeJeunesNonValidesRoute;
  PostValiderBasculeJeunesValides: PostValiderBasculeJeunesValidesRoute;
  PostValiderBasculeJeunesNonValides: PostValiderBasculeJeunesNonValidesRoute;
  PostInscriptionsExport: PostInscriptionsExportRoute;
  PostInscriptionsScolariseExport: PostInscriptionsScolariseExportRoute;
};
