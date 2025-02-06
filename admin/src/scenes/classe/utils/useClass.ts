import { ClasseService } from "@/services/classeService";
import { useQuery } from "@tanstack/react-query";
import { ClasseType } from "snu-lib";

export default function useClass(id: string) {
  return useQuery<ClasseType>({
    queryKey: ["classe", id],
    queryFn: async () => await ClasseService.getOne(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
}
