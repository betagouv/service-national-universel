import api from "@/services/api";
import { download } from "snu-lib";

const url = "/classe/:id/convocations";
export const downloadCertificatesByClassId = async (classeId) => {
  const file = await api.openpdf(url.replace(":id", classeId), {});
  download(file, "convocations.pdf");
};
