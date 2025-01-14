import { fetchCohort } from "@/utils/cohorts";
import * as Sentry from "@sentry/react";
import { Dispatch } from "redux";
import { YoungType } from "snu-lib";
import { setCohort } from "../cohort/actions";

export const authActions = {
  SETYOUNG: "SETYOUNG",
};

export function setYoung(young?: YoungType) {
  return async (dispatch: Dispatch, getState: () => any) => {
    const oldCohortId = getState().Auth.young?.cohortId;

    dispatch({ type: authActions.SETYOUNG, young });

    // Side effects
    if (young) Sentry.setUser({ id: young._id, email: young.email, username: `${young.firstName} ${young.lastName}` });
    else Sentry.setUser(null);

    const newCohortId = young?.cohortId;
    if (newCohortId && oldCohortId !== newCohortId) {
      const cohort = await fetchCohort(newCohortId);
      if (!cohort) return;
      dispatch(setCohort(cohort));
    }
  };
}
