import { fetchClass } from "@/services/classe.service";
import { validateId } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export default function useClass(id?: string) {
  return useQuery({
    queryKey: ["class", id],
    queryFn: () => fetchClass(id),
    enabled: validateId(id),
  });
}
