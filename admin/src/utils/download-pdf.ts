import { toastr } from "react-redux-toastr";
import { download } from "snu-lib";

import api from "../services/api";
import { capture } from "../sentry";

export default async function downloadPDF({
  url,
  body,
  fileName,
  redirectUrl = "/auth/login?disconnected=1",
  errorTitle = "Une erreur est survenue lors du téléchargement",
}: {
  url: string;
  body?: any;
  fileName: string;
  redirectUrl?: string;
  errorTitle?: string;
}) {
  try {
    const file = await api.openpdf(url, body);
    download(file, fileName);
  } catch (e) {
    if (e?.code === "YOUNG_NOT_FOUND") {
      toastr.warning("Aucun jeune trouvé. Aucun document à télécharger.", "");
      return;
    }
    // We don't capture unauthorized. Just redirect.
    if (e?.message === "unauthorized") {
      window.location.href = redirectUrl;
      return;
    }
    // We need more info to understand download issues.
    capture(e);

    toastr.error(errorTitle + (e.code === "PDF_ERROR" ? ", merci de réessayer ultérieurement" : ""), e?.message, { timeOut: 10000 });
  }
}
