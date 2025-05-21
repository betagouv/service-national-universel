import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { COHORTS_ACTIONS } from "@/redux/cohorts/actions";
import { toastr } from "react-redux-toastr";
import api from "@/services/api";
import { capture } from "@/sentry";
import { translate } from "snu-lib";
import { InfosGeneralesFormData } from "../components/general/InfosGenerales";
import { InscriptionsFormData } from "../components/phase0/InfosInscriptions";
import { PreparationFormData } from "../components/phase1/InfosPreparation";
import { AffectationsFormData } from "../components/InfosAffectation";
import { SettingCleFormData } from "../components/CleSettings";
import { EligibilityForm } from "../../eligibility/EligibilityTab";

type UpdateCohortPayload<T, S extends string> = {
  data: T;
  cohortId: string;
  section: S;
};

export const createCohortMutation = <T, S extends string>(section: S) => {
  return () => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (payload: Omit<UpdateCohortPayload<T, S>, "section">) => {
        const response = await api.put(`/cohort/${payload.cohortId}/${section}`, payload.data);
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
};

export const useUpdateCohortGeneral = createCohortMutation<InfosGeneralesFormData, "general">("general");
export const useUpdateCohortInscriptions = createCohortMutation<InscriptionsFormData, "inscriptions">("inscriptions");
export const useUpdateCohortPreparation = createCohortMutation<PreparationFormData, "preparation">("preparation");
export const useUpdateCohortAffectation = createCohortMutation<AffectationsFormData, "affectation">("affectation");
export const useUpdateCohortCle = createCohortMutation<SettingCleFormData, "cleSetting">("cleSetting");
export const useUpdateEligibilityMutation = createCohortMutation<EligibilityForm, "eligibility">("eligibility");
