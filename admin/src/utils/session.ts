import { CohortState } from "@/redux/cohorts/reducer";
import { Session } from "@/types";
import dayjs from "dayjs";

export function getNextSession(sessions: Session[], cohorts: CohortState["Cohorts"]) {
  return sessions
    .map((session) => ({
      ...session,
      dateStart: session.dateStart || cohorts.find((cohort) => cohort.name === session.cohort)?.dateStart,
    }))
    .filter((session) => dayjs(session.dateStart).isAfter(dayjs()))[0];
}
