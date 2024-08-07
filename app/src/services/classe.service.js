import { apiURL } from "@/config";
import { translateColoration } from "snu-lib";

export const fetchClass = (id) =>
  fetch(`${apiURL}/cle/classe/${id}`)
    .then((res) => res.json())
    .then((res) => {
      if (!res.ok) throw new Error(res.code);
      return formatClass(res.data);
    });

export function formatClass(data) {
  const { name, status, coloration, grade, referents, etablissement, cohort } = data;
  const [{ fullName: referent }] = referents;
  const classe = {
    id: data._id,
    name,
    coloration: translateColoration(coloration),
    cohort,
    status,
    grade,
    referent,
    etablissement,
  };
  return classe;
}
