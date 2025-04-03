import API from "@/services/api";

export async function getPatches(model, value) {
  const { ok, data, code } = await API.get(`/${model}/${value._id}/patches`);
  if (!ok) throw new Error(code);
  return data;
}
