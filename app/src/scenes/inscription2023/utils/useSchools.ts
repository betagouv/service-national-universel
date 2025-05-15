import { useQuery } from "@tanstack/react-query";
import { getSchools } from ".";

export default function useSchools({ city, departmentName }: { city?: string; departmentName?: string }) {
  return useQuery({
    queryFn: () => getSchools(city!, departmentName!),
    queryKey: ["schools", city, departmentName],
    enabled: !!city && !!departmentName,
  });
}
