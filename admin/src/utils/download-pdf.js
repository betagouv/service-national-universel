import { toastr } from "react-redux-toastr";
import * as Sentry from "@sentry/browser";
import { download } from "snu-lib";

import api from "../services/api";

export default async function downloadPDF({ url, body, fileName, redirectUrl = "/auth/login?disconnected=1", errorTitle = "Une erreur est survenue lors du téléchargement" }) {
  try {
    const file = await api.openpdf(url, body);
    download(file, fileName);
  } catch (e) {
    // We don't capture unauthorized. Just redirect.
    if (e?.message === "unauthorized") {
      return (window.location.href = redirectUrl);
    }
    // We need more info to understand download issues.
    Sentry.captureMessage("PDF error for URL: " + url);
    Sentry.captureException(e);
    toastr.error(errorTitle, e?.message, { timeOut: 10000 });
  }
}
