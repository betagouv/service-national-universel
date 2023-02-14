import { apiAdress } from "../../services/api-adresse";

export const getAddress = async (text) => {
  const res = await apiAdress(`${encodeURIComponent(text)}`);
  return res;
};
