import useAuth from "@/services/useAuth";
import useCohort from "@/services/useCohort";
import { useQuery } from "@tanstack/react-query";
import { getDepartureDate, getReturnDate } from "snu-lib";
import { getCenter, getMeetingPoint, getSession } from "./affectationRepository";

export default function useAffectationInfo() {
  const { young } = useAuth();
  const { cohort } = useCohort();

  const centerQuery = useQuery({
    queryKey: ["center", young.sessionPhase1Id],
    queryFn: () => getCenter(young.sessionPhase1Id!),
    enabled: !!young.sessionPhase1Id,
  });

  const meetingPointQuery = useQuery({
    queryKey: ["meetingPoint", young._id],
    queryFn: () => getMeetingPoint(young._id),
    enabled: !!young._id,
  });

  const sessionQuery = useQuery({
    queryKey: ["session", young._id],
    queryFn: () => getSession(young._id),
    enabled: !!young._id,
  });

  return {
    isPending: centerQuery.isLoading || meetingPointQuery.isLoading || sessionQuery.isLoading,
    isError: centerQuery.isError || meetingPointQuery.isError || sessionQuery.isError,
    center: centerQuery.data,
    meetingPoint: meetingPointQuery.data,
    session: sessionQuery.data,
    departureDate: getDepartureDate(young, sessionQuery.data, cohort, meetingPointQuery.data),
    returnDate: getReturnDate(young, sessionQuery.data, cohort, meetingPointQuery.data),
  };
}
