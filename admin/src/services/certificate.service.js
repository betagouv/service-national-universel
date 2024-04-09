import api from "@/services/api";
import { download } from "snu-lib";
import { toastr } from "react-redux-toastr";
import { capture } from "@/sentry";
// TODO : error handler
const url = "/v2/classe/:id/certificates";
export const downloadCertificatesByClassId = async (classeId) => {
  try {
    const file = await api.openpdf(url.replace(":id", classeId), {});
    download(file, "Attestations.zip");
  } catch (e) {
    if (e?.code === "YOUNG_NOT_FOUND") {
      toastr.warning("Aucun jeune trouvé. Aucun document à télécharger.");
      return;
    }
    capture(e);
  }
};
