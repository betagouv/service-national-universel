import { apiURL } from "@/config";
import API from "@/services/api";

export async function fetchPrograms() {
  const res = await fetch(`${apiURL}/program/public/engagements`);
  const { ok, data, error } = await res.json();
  if (!ok) throw new Error(error.message);
  return data;
}

export async function fetchApplications(youngId) {
  const res = await fetch(`${apiURL}/young/${youngId}/application`, {
    headers: { Authorization: `JWT ${API.getToken()}` },
  });
  const { ok, data, error } = await res.json();
  if (!ok) throw new Error(error.message);
  return data.map((e) => ({ ...e, engagementType: "mig" }));
}

export async function fetchEquivalences(youngId) {
  const res = await fetch(`${apiURL}/young/${youngId}/phase2/equivalences`, {
    headers: { Authorization: `JWT ${API.getToken()}` },
  });
  const { ok, data, error } = await res.json();
  if (!ok) throw new Error(error.message);
  return data.map((e) => ({ ...e, engagementType: "equivalence" }));
}
