import API from "@/services/api";
import { useQuery } from "@tanstack/react-query";

async function queryFn() {
  const { ok, data } = await API.get(`/SNUpport/ticketsInfo`);
  if (!ok) throw new Error("API response not OK");
  if (!data) throw new Error("No data");
  return data;
}

const useTickets = () => useQuery({ queryKey: ["ticketsInfo"], queryFn });

export default useTickets;
