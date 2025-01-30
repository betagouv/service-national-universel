import API from "@/services/api";
import { useQuery } from "@tanstack/react-query";

async function getFilterLabels(listType: string): Promise<any> {
  const { ok, data } = await API.get(`/filter-label/${listType}`);
  if (!ok) throw new Error("Impossible de récupérer les labels de filtres.");
  return data;
}

export default function useFilterLabels(listType: string) {
  return useQuery({
    queryKey: ["filter-label", listType],
    queryFn: () => getFilterLabels(listType),
  });
}
