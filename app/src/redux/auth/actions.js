import * as Sentry from "@sentry/react";

export const authActions = {
  SETYOUNG: "SETYOUNG",
};

export function setYoung(young) {
  if (young) Sentry.setUser({ id: young._id, email: young.email, username: `${young.firstName} ${young.lastName}` });
  return { type: authActions.SETYOUNG, young };
}
