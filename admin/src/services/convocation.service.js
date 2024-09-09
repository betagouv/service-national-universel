import api from "@/services/api";
import { download } from "snu-lib";

const url = "/cle/classe/:id/certificate/:key";
export const downloadCertificatesByClassId = async (classeId, key) => {
  const file = await api.openpdf(url.replace(":id", classeId).replace(":key", key), {});
  download(file, `${key}.pdf`);
};
