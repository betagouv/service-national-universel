import API from "@/services/api";
import { CohesionCenterType, DepartmentServiceType, PointDeRassemblementType, SessionPhase1Type, YoungType } from "snu-lib";

export async function getCenter(sessionPhase1Id: string): Promise<CohesionCenterType> {
  const { ok, data: center, code } = await API.get(`/session-phase1/${sessionPhase1Id}/cohesion-center`);
  if (!ok) throw new Error(code);
  return center;
}

export async function getMeetingPoint(youngId: string): Promise<any> {
  const { ok, data: meetingPoint, code } = await API.get(`/young/${youngId}/point-de-rassemblement?withbus=true`);
  if (!ok) throw new Error(code);
  return meetingPoint;
}

export async function getSession(youngId: string): Promise<SessionPhase1Type> {
  const { ok, data: session, code } = await API.get(`/young/${youngId}/session/`);
  if (!ok) throw new Error(code);
  return session;
}

export async function getAvailableMeetingPoints(): Promise<PointDeRassemblementType[]> {
  const { ok, data, code } = await API.get(`/point-de-rassemblement/available`);
  if (!ok) throw new Error(code);
  return data;
}

export async function updateMeetingPoint(youngId: string, payload): Promise<YoungType> {
  const { data, ok, code } = await API.put(`/young/${youngId}/point-de-rassemblement`, payload);
  if (!ok) throw new Error(code);
  return data;
}

export async function getDepartmentService(department: string): Promise<DepartmentServiceType> {
  const { data, code, ok } = await API.get(`/department-service/${department}`);
  if (!ok) throw new Error(code);
  return data;
}

export async function updateConvocationFileDownload(value: "true" | "false"): Promise<YoungType> {
  const payload = { convocationFileDownload: value };
  const { ok, code, data } = await API.put(`/young/phase1/convocation`, payload);
  if (!ok) throw new Error(code);
  return data;
}
