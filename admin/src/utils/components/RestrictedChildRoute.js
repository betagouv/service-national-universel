import React from "react";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { ROLES_LIST } from "snu-lib";
import { SentryRoute } from "../../sentry";

const RestrictedChildRoute = ({ component: Component, roles = ROLES_LIST, redirectTo = "/dashboard", ...rest }) => {
  const user = useSelector((state) => state.Auth.user);

  if (!roles.includes(user.role)) {
    return <Redirect to={redirectTo} />;
  }
  return <SentryRoute {...rest} render={(props) => <Component {...props} />} />;
};

export default RestrictedChildRoute;
