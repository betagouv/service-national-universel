import * as Sentry from "@sentry/react";

export const authActions = {
  SETYOUNG: "SETYOUNG",
};

export function setYoung(young) {
  return (dispatch, getState) => {
    const currentYoung = getState().auth.young;
    const updatedYoung = {
      ...young,
      cohortData: young?.cohortData || currentYoung.cohortData,
    };

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
