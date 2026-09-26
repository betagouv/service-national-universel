import API from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { AuthState } from "@/redux/auth/reducer";

async function queryFn() {
  const { ok, data } = await API.get(`/SNUpport/ticketsInfo`);
  if (!ok) throw new Error("API response not OK");
  if (!data) throw new Error("No data");
  return data;
}

const useTickets = () => {
  const young = useSelector((state: AuthState) => state.Auth.young);
  return useQuery({ queryKey: ["ticketsInfo", { youngId: young?._id }], queryFn });
};

export default useTickets;
