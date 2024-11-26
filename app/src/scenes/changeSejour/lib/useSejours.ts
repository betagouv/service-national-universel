import { getAvailableSessions } from "@/services/cohort.service";
import useAuth from "@/services/useAuth";
import { useQuery } from "@tanstack/react-query";

export default function useSejours() {
  const { young } = useAuth();
  return useQuery({
    queryKey: ["availableSessions", young],
    queryFn: () => getAvailableSessions(young),
    enabled: !!young,
  });
}
