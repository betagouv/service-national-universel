import { apiURL } from "@/config";
import { STATUS_CLASSE, translateColoration } from "snu-lib";

export const fetchClass = (id) =>
  fetch(`${apiURL}/cle/classe/${id}`)
    .then((res) => res.json())
    .then((res) => {
      if (!res.ok) throw new Error(res.code);
      return formatClass(res.data);
    });

export function formatClass(data) {
  const { name, status, coloration, grade, isFull, referents, etablissement, cohort } = data;
  const [{ fullName: referent }] = referents;
  const isInscriptionOpen = [STATUS_CLASSE.OPEN].includes(status) && !isFull;
  const classe = {
    id: data._id,
    name,
    coloration: translateColoration(coloration),
    cohort,
    status,
    grade,
    isFull,
    isInscriptionOpen,
    referent,
    etablissement,
    // TODO: update CLE cohort dates
    dateStart: "À venir",
  };
  return classe;
}
