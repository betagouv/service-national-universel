import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { COHORTS_ACTIONS } from "@/redux/cohorts/actions";
import { queryClient } from "@/services/react-query";
import { toastr } from "react-redux-toastr";
import api from "@/services/api";
import { capture } from "@/sentry";
import { translate } from "snu-lib";
import { InfosGeneralesFormData } from "../components/general/InfosGenerales";

type UpdateCohortPayload = {
  data: InfosGeneralesFormData;
  cohortId: string;
};

export const useUpdateCohortGeneral = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async (payload: UpdateCohortPayload) => {
      const response = await api.put(`/cohort/${payload.cohortId}/general`, payload.data);
      return response;
    },
    onSuccess: (response) => {
      const cohort = response.data;
      dispatch({ type: COHORTS_ACTIONS.UPDATE_COHORT, payload: cohort });
      queryClient.invalidateQueries({ queryKey: ["cohort", cohort.name] });
      toastr.success("Succès", "Session mise à jour avec succès");
    },
    onError: (error: Error) => {
      console.log(error);
      capture(error);
      toastr.error("Oups, une erreur est survenue lors de la mise à jour de la session", translate(error.message));
    },
  });
};
