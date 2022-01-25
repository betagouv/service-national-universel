import useSWR from "swr";
import API from "../services/api";

const TicketsTable = () => {
  const { data, mutate, error } = useSWR(API.getUrl({ path: "/support-center/ticket" }));
  console.log(data);

  return null;
};

export default TicketsTable;
