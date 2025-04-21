import API from "@/services/api";
import { translate, YoungType } from "snu-lib";

export async function validateStepConvocation(): Promise<YoungType> {
  const { ok, code, data } = await API.put(`/young/phase1/convocation`, { convocationFileDownload: "true" });
  if (!ok) {
    throw new Error(translate(code));
  }
  return data;
}
