import { toastr } from "react-redux-toastr";
import * as Sentry from "@sentry/react";
import { download } from "snu-lib";

import api from "../services/api";
import { capture } from "../sentry";

export default async function downloadPDF({ url, body, fileName, redirectUrl = "/auth/login?disconnected=1", errorTitle = "Une erreur est survenue lors du téléchargement" }) {
  try {
    console.log("Downloading PDF from URL11:", url, "with body:", body, "intended fileName:", fileName);
    const file = await api.openpdf(url, body);
    console.log("Download successful, file:", file);

    download(file, fileName);
  } catch (e) {
    if (e?.code === "YOUNG_NOT_FOUND") {
      toastr.warning("Aucun jeune trouvé. Aucun document à télécharger.");
      return;
    }
    // We don't capture unauthorized. Just redirect.
    if (e?.message === "unauthorized") {
      return (window.location.href = redirectUrl);
    }
    // We need more info to understand download issues.
    capture(e);
    console.log("EEEURRREURRRR PDF", e);
    toastr.error(errorTitle + (e.code === "PDF_ERROR" ? ", merci de réessayer ultérieurement" : ""), e?.message, { timeOut: 10000 });
  }
}
