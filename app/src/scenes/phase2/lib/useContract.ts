import { useQuery } from "@tanstack/react-query";
import { fetchContract } from "../engagement.repository";

export default function useContract(id: string) {
  return useQuery({ queryKey: ["contract", id], queryFn: () => fetchContract(id) });
}
