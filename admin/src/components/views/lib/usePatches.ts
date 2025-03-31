import { useQuery } from "@tanstack/react-query";
import { getPatches } from "./patchesRepository";

export function usePatches(model, value) {
  return useQuery({
    queryKey: [model, value],
    queryFn: () => getPatches(model, value),
  });
}
