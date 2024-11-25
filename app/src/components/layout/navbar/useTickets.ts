import API from "@/services/api";
import { useQuery } from "@tanstack/react-query";

async function fetchTickets() {
  const { ok, data } = await API.get(`/SNUpport/ticketsInfo`);
  if (!ok) throw new Error("API response not OK");
  return data;
}

export default function useTickets() {
  return useQuery({
    queryKey: ["ticketsInfo"],
    queryFn: fetchTickets,
    meta: { errorMessage: "Impossible de récupérer les tickets" },
  });
}
