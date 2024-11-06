import { CohortState } from "@/redux/cohorts/reducer";
import { Session } from "@/types";
import dayjs from "dayjs";

export function getDefaultSession(sessions: Session[], cohorts: CohortState["Cohorts"]) {
  // On regarde la session non terminée la plus proche dans le futur. Une session est considérée terminée 3 jours après la date de fin du séjour.
  const filteredSessions = sessions.filter((session) =>
    dayjs(session.dateStart || cohorts.find((cohort) => cohort.name === session.cohort)?.dateStart).isAfter(dayjs().add(3, "day")),
  );
  if (filteredSessions.length > 0) return filteredSessions[0];
  return sessions[sessions.length - 1];
}

export function getDefaultCohort(cohorts: CohortState["Cohorts"]) {
  const sortedCohorts = cohorts.sort((a, b) => dayjs(a.dateStart).diff(dayjs(b.dateStart)));
  const upcomingCohorts = cohorts.filter((c) => dayjs(c.dateStart).isAfter(dayjs()));
  if (upcomingCohorts.length === 0) {
    return sortedCohorts[sortedCohorts.length - 1];
  }
  return upcomingCohorts[0];
}
