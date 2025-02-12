import { useQuery } from "@tanstack/react-query";
import { fetchStructure } from "../engagement.repository";

export default function useStructure(id: string) {
  return useQuery({ queryKey: ["structure", id], queryFn: () => fetchStructure(id) });
}
