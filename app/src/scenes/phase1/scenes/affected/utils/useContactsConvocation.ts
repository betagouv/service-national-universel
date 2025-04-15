import useCohort from "@/services/useCohort";
import { useQuery } from "@tanstack/react-query";
import { getDepartmentService } from "./affectationRepository";
import useAuth from "@/services/useAuth";

export default function useContactsConvocation() {
  const { young } = useAuth();
  const { cohort } = useCohort();
  const res = useQuery({
    queryKey: ["department-service", young.department],
    queryFn: () => getDepartmentService(young.department!),
    enabled: !!young.department,
  });
  const data = res.data?.contacts.filter((contact) => contact.cohort === cohort.name);
  return { ...res, data };
}
