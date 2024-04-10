import api from "@/services/api";
import { download } from "snu-lib";
import { toastr } from "react-redux-toastr";
import { capture } from "@/sentry";
const url = "/v2/classe/:id/convocations";
export const downloadCertificatesByClassId = async (classeId) => {
  try {
    const file = await api.openpdf(url.replace(":id", classeId), {});
    download(file, "Convocations.zip");
  } catch (e) {
    toastr.warning("Téléchargement des convocations impossible");
    capture(e);
  }
};
