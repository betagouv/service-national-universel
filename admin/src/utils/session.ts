import { CohortState } from "@/redux/cohorts/reducer";
import { Session } from "@/types";
import dayjs from "dayjs";

export function getDefaultSession(sessions: Session[], cohorts: CohortState["Cohorts"]) {
  const filteredSessions = sessions.filter((session) => dayjs(session.dateStart || cohorts.find((cohort) => cohort.name === session.cohort)?.dateStart).isAfter(dayjs()));
  if (filteredSessions.length > 0) return filteredSessions[0];
  return sessions[sessions.length - 1];
}
