import API from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { ApplicationType } from "snu-lib";

async function fetchApplications(youngId: string): Promise<ApplicationType[]> {
  const { ok, data, code } = await API.get(`/young/${youngId}/application`);
  if (!ok) throw new Error(code);
  return data;
}

export default function useApplications(youngId: string) {
  return useQuery({
    queryKey: ["application", youngId],
    queryFn: () => fetchApplications(youngId),
  });
}
