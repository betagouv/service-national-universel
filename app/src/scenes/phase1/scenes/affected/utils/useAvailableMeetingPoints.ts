import { useQuery } from "@tanstack/react-query";
import { getAvailableMeetingPoints } from "./affectationRepository";

export default function useAvailableMeetingPoints() {
  return useQuery({ queryKey: ["meetingPoints"], queryFn: getAvailableMeetingPoints });
}
