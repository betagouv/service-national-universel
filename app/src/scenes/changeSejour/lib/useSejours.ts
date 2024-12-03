import { getAvailableSessions } from "@/services/cohort.service";
import useAuth from "@/services/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function useSejours() {
  const { young } = useAuth();
  return useQuery({
    queryKey: ["availableSessions", young.cohortId],
    queryFn: () => getAvailableSessions(young),
    enabled: !!young,
  });
}
