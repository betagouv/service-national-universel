import * as Sentry from "@sentry/react";

export const authActions = {
  SETYOUNG: "SETYOUNG",
};

export function setYoung(young) {
  return (dispatch, getState) => {
    const currentYoung = getState().Auth?.young;
    const updatedYoung = young
      ? {
          ...young,
          // Keep old cohort data if new young is not populated
          cohortData: young?.cohortData || currentYoung?.cohortData,
        }
      : null;

    if (updatedYoung) {
      Sentry.setUser({
        id: updatedYoung._id,
        email: updatedYoung.email,
        username: `${updatedYoung.firstName} ${updatedYoung.lastName}`,
      });
    } else {
      Sentry.setUser(null);
    }

    dispatch({ type: authActions.SETYOUNG, young: updatedYoung });
  };
}
