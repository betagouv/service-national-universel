import { apiURL } from "@/config";
import { translateColoration } from "snu-lib";

export const fetchClass = (id, params = {}) =>
  fetch(`${apiURL}/cle/classe/public/${id}?${new URLSearchParams(params).toString()}`)
    .then((res) => res.json())
    .then((res) => {
      if (!res.ok) throw new Error(res.code);
      return formatClass(res.data);
    });

export function formatClass(data) {
  const [{ fullName: referent }] = data.referents;
  const classe = {
    id: data._id,
    coloration: translateColoration(data.coloration),
    referent,
    ...data,
  };
  return classe;
}
