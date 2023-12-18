import { apiURL } from "@/config";
import { STATUS_CLASSE, translateColoration } from "snu-lib";
import { useQuery } from "@tanstack/react-query";

const useClass = (classeId) => {
  const validateClasseId = (classeId) => {
    if (!classeId || !classeId.match(/^[0-9a-fA-F]{24}$/)) return false;
    return true;
  };

  const getClass = () =>
    fetch(`${apiURL}/cle/classe/${classeId}`)
      .then((res) => res.json())
      .then((res) => {
        if (!res.ok) throw new Error(res.code);
        return res.data;
      });
  const { isPending, isError, data, error } = useQuery({ queryKey: [`class-${classeId}`], queryFn: getClass, enabled: validateClasseId(classeId) });
  if (!data) return { isPending, isError, error };

  const { name, status, coloration, grade, isFull, referents, etablissement, cohort } = data;
  const [{ fullName: referent }] = referents;
  const isInscriptionOpen = [STATUS_CLASSE.INSCRIPTION_IN_PROGRESS, STATUS_CLASSE.CREATED].includes(status) && !isFull;
  const classe = {
    id: classeId,
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

  return {
    classe,
    isPending,
    isError,
    error,
  };
};

export default useClass;
