import API from "@/services/api";
import { CohesionCenterType, LigneBusDto, LigneBusType, SessionPhase1Type } from "snu-lib";

export type SessionPhase1PopulatedWithCenter = SessionPhase1Type & { cohesionCenter: CohesionCenterType };

const SessionPhase1Service = {
  async getSessions(filters: Record<string, string[]>): Promise<SessionPhase1PopulatedWithCenter[]> {
    const body = { filters, size: 100 };
    const { responses } = await API.post("/elasticsearch/sessionphase1/search?needCohesionCenterInfo=true", body);
    return responses[0].hits.hits.map((hit) => ({ _id: hit._id, ...hit._source }));
  },
  async updateSessionSurLigneDeBus(busId: string, payload: Partial<LigneBusType>): Promise<LigneBusDto> {
    const { ok, code, data } = await API.put(`/ligne-de-bus/${busId}/centre`, payload);
    if (!ok) throw new Error(code);
    if (!data) throw new Error("No data returned");
    return data;
  },
};

export { SessionPhase1Service };
