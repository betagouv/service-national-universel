import { apiURL } from "@/config";
import API from "@/services/api";
import * as FileSaver from "file-saver";
import { ProgramType } from "snu-lib";

export async function fetchPrograms() {
  const res = await fetch(`${apiURL}/program/public/engagements`);
  const { ok, data, error } = await res.json();
  if (!ok) throw error;
  return data.sort((a, b) => a.name.localeCompare(b.name)) as ProgramType[];
}

export async function fetchProgram(id) {
  const res = await fetch(`${apiURL}/program/public/engagement/${id}`);
  const { ok, data, error } = await res.json();
  if (!ok) throw error;
  return data as ProgramType;
}

export async function fetchApplications(youngId) {
  const res = await fetch(`${apiURL}/young/${youngId}/application`, {
    credentials: "include",
  });
  const { ok, data, error } = await res.json();
  if (!ok) throw error;
  return data.map((e) => ({ ...e, engagementType: "mig" }));
}

export async function fetchEquivalences(youngId) {
  const res = await fetch(`${apiURL}/young/${youngId}/phase2/equivalences`, {
    credentials: "include",
  });
  const { ok, data, error } = await res.json();
  if (!ok) throw error;
  return data.map((e) => ({ ...e, engagementType: "equivalence" }));
}

export async function fetchEquivalence(youngId, id) {
  const res = await fetch(`${apiURL}/young/${youngId}/phase2/equivalence/${id}`, {
    credentials: "include",
  });
  const { ok, data, error } = await res.json();
  if (!ok) throw error;
  return data;
}

export async function fetchEquivalenceFile(youngId, fileName) {
  const f = await API.get(`/young/${youngId}/phase2/equivalence-file/${fileName}`);
  FileSaver.saveAs(new Blob([new Uint8Array(f.data.data)], { type: f.mimeType }), f.fileName.replace(/[^a-z0-9]/i, "-"));
}

export async function fetchAttestation(youngId, template, sendEmail) {
  const res = await fetch(`${apiURL}/young/${youngId}/documents/certificate/${template}${sendEmail ? "/send-email" : ""}`, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Erreur lors du téléchargement de l'attestation");
  if (sendEmail) return;
  const file = await res.blob();
  return file;
}

export async function fetchMissionsFromApiEngagement(filters, page, size, sort) {
  const res = await fetch(`${apiURL}/elasticsearch/missionapi/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ filters, page, size, sort }),
  });
  const { ok, data, error } = await res.json();
  if (!ok) throw error;
  return data;
}
