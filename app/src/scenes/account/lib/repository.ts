import API from "@/services/api";
import { YoungType } from "snu-lib";

export async function updateYoung(path: string, payload: Partial<YoungType>): Promise<YoungType> {
  const { ok, code, data } = await API.put(`/young/account/${path}`, payload);
  if (!ok) throw new Error(code);
  if (!data) throw new Error("No data");
  return data;
}
