import API from "@/services/api";
import { YoungType } from "snu-lib";

export async function updateYoung(path: string, payload: Partial<YoungType>): Promise<YoungType> {
  const { ok, code, data } = await API.put(`/young/account/${path}`, payload);
  if (!ok) throw new Error(code);
  if (!data) throw new Error("No data");
  return data;
}

export async function updatePassword({ password, verifyPassword, newPassword }: { password: string; newPassword: string; verifyPassword: string }): Promise<YoungType> {
  const { ok, code, user } = await API.post("/young/reset_password", { password, verifyPassword, newPassword });
  if (!ok) throw new Error(code);
  if (!user) throw new Error("No user");
  return user;
}
