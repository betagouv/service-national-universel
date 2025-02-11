import { buildRequest } from "@/utils/buildRequest";
import { useQuery } from "@tanstack/react-query";
import { FilterLabelDto, FilterLabelRoutes } from "snu-lib";

async function getFilterLabels(listType: string): Promise<FilterLabelDto> {
  const { ok, code, data } = await buildRequest<FilterLabelRoutes["Get"]>({
    path: "/filter-label/{listType}",
    method: "GET",
    params: { listType },
  })();
  if (!ok) throw new Error(code);
  if (!data) throw new Error("No data");
  return data;
}

export default function useFilterLabels(listType: string) {
  return useQuery({
    queryKey: ["filter-label", listType],
    queryFn: () => getFilterLabels(listType),
    refetchOnWindowFocus: false,
  });
}
