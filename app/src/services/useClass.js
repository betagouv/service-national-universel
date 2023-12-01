import { apiURL } from "@/config";
import { STATUS_CLASSE, translateColoration } from "snu-lib";
import { useQuery } from "@tanstack/react-query";

const useClass = (classeId) => {
  const getClass = () => fetch(`${apiURL}/cle/classe/${classeId}`).then((res) => res.json());
  const { isPending, isError, data, error } = useQuery({ queryKey: [`class-${classeId}`], queryFn: getClass, enabled: !!classeId });
  if (!data?.data) return { isPending, isError, error };

  const { name, status, coloration, isFull, referents, etablissement, cohort } = data.data;
  const [{ fullName: referent }] = referents;
  const isInscriptionOpen = [STATUS_CLASSE.INSCRIPTION_IN_PROGRESS, STATUS_CLASSE.CREATED].includes(status) && !isFull;
  const classe = {
    name,
    coloration: translateColoration(coloration),
    cohort,
    status,
    isFull,
    isInscriptionOpen,
    referent,
    etablissement: etablissement.name,
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
