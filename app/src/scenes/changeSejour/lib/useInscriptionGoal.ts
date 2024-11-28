import API from "@/services/api";
import useAuth from "@/services/useAuth";
import { useQuery } from "@tanstack/react-query";

const getInscriptionGoalReachedNormalized = async ({ department, cohortName }) => {
  const { data, ok, code }: { data?: boolean; ok: boolean; code?: string } = await API.get(
    `/inscription-goal/${encodeURIComponent(cohortName)}/department/${encodeURIComponent(department)}/reached`,
  );
  if (!ok) throw new Error(code);
  return data;
};

export default function useInscriptionGoal(cohortName: string) {
  const { young } = useAuth();
  return useQuery({
    queryFn: () => getInscriptionGoalReachedNormalized({ department: young.department, cohortName }),
    queryKey: ["inscriptionGoal"],
    enabled: (!!cohortName && !!young.department) as boolean,
  });
}
