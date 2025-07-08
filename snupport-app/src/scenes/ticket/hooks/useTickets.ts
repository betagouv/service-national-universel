import { useQuery } from "@tanstack/react-query";
import { getTickets } from "../service";

export default function useTickets(filter: Record<string, any>) {
  return useQuery({
    queryKey: ["tickets", { filter }],
    queryFn: () => getTickets(filter),
    refetchInterval: 1000 * 60,
  });
}
