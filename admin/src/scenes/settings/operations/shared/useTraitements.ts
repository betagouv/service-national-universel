import { Phase1Service } from "@/services/phase1Service";
import { useQuery } from "@tanstack/react-query";

export default function useTraitements({ sessionId, action, sort }: { sessionId: string; action: string; sort: "ASC" | "DESC" }) {
  return useQuery({
    queryKey: ["phase-traitements", action, sort],
    queryFn: async () => await Phase1Service.getTraitements(sessionId!, { name: action, sort }),
  });
}
