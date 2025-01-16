import API from "@/services/api";
import { CohesionCenterType, MeetingPointType, SessionPhase1Type } from "snu-lib";

export async function getCenter(sessionPhase1Id: string): Promise<CohesionCenterType> {
  const { data: center } = await API.get(`/session-phase1/${sessionPhase1Id}/cohesion-center`);
  return center;
}

export async function getMeetingPoint(youngId: string): Promise<MeetingPointType> {
  const { data: meetingPoint } = await API.get(`/young/${youngId}/point-de-rassemblement?withbus=true`);
  return meetingPoint;
}

export async function getSession(youngId: string): Promise<SessionPhase1Type> {
  const { data: session } = await API.get(`/young/${youngId}/session/`);
  return session;
}

export async function getAvailableMeetingPoints() {
  const { ok, data, code } = await API.get(`/point-de-rassemblement/available`);
  if (!ok) throw new Error(code);
  return data;
}
