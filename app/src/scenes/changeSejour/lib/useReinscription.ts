import { fetchReInscriptionOpen } from "@/services/reinscription.service";
import { useQuery } from "@tanstack/react-query";

export default function useReinscription() {
  return useQuery({
    queryKey: ["isReInscriptionOpen"],
    queryFn: fetchReInscriptionOpen,
  });
}
