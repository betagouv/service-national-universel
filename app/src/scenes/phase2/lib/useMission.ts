import { useQuery } from "@tanstack/react-query";
import { fetchMission } from "../engagement.repository";

export default function useMission(id: string) {
  return useQuery({ queryKey: ["mission", id], queryFn: () => fetchMission(id) });
}
