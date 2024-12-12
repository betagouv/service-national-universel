import { useQuery } from "@tanstack/react-query";
import { fetchPrograms } from "../engagement.repository";

export default function usePrograms() {
  return useQuery({ queryFn: fetchPrograms, queryKey: ["program"] });
}
