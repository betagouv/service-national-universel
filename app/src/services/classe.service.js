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
  const { name, status, coloration, grades, referents, etablissement, cohort, cohortDetails, schoolYear } = data;
  const [{ fullName: referent }] = referents;
  const classe = {
    id: data._id,
    name,
    coloration: translateColoration(coloration),
    cohort,
    status,
    grades,
    referent,
    etablissement,
    cohortDetails,
    schoolYear,
  };
  return classe;
}
