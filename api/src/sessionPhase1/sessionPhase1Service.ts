import { SessionPhase1Document, SessionPhase1Model } from "../models";

export const getSessionPhase1ByIds = async (sessionIds: string[]): Promise<SessionPhase1Document[]> => {
  const sessions = await SessionPhase1Model.find({ _id: { $in: sessionIds } });

  if (sessions.length !== sessionIds.length) {
    const foundIds = sessions.map((session) => session._id.toString());
    const missingIds = sessionIds.filter((id) => !foundIds.includes(id));
    throw new Error(`Sessions not found: ${missingIds.join(", ")}`);
  }

  return sessions;
};
