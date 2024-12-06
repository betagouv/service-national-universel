import { getAvailableSessions } from "@/services/cohort.service";
import { useQuery } from "@tanstack/react-query";

export default function useSejours() {
  return useQuery({
    queryKey: ["availableSessions"],
    queryFn: () => getAvailableSessions(),
  });
}
