import API from "./api";

export async function getAgents() {
  const { ok, data, code } = await API.get({ path: `/agent/` });
  if (!ok) {
    throw new Error(code);
  }
  return data;
}
