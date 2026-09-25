// Filtre des URL des nœuds Slate des articles (FH17). Le contenu écrit ici est rendu tel quel dans
// cet éditeur comme sur support.snu.gouv.fr : `javascript:` s'exécute dans un href au clic, et dans
// le src d'une iframe sans aucun clic. Même filtre que le reste de snupport-app (utils/safeUrl.js,
// copie de celui de snu-lib), qui accepte en plus ici les liens internes entre articles.
import { sanitizeLinkUrl as sanitizeAnyLinkUrl } from "../../../utils/safeUrl.js";

export { sanitizeImageUrl, sanitizeVideoUrl } from "../../../utils/safeUrl.js";

/** Lien d'article : http, https, mailto ou lien interne `/base-de-connaissance/...` ; sinon null. */
export const sanitizeLinkUrl = (value) => sanitizeAnyLinkUrl(value, { allowSitePath: true });
