import React from "react";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { ROLES_LIST } from "snu-lib";
import { SentryRoute } from "../../sentry";

const RestrictedChildRoute = ({ component: Component, allowedRoles = ROLES_LIST, redirectUnauthorizedTo = "/dashboard", ...rest }) => {
  const user = useSelector((state) => state.Auth.user);

  let redirectTo = redirectUnauthorizedTo;

  if (typeof redirectUnauthorizedTo === "object") {
    const routeRule = Object.entries(redirectUnauthorizedTo).find(([, routeRuleValue]) => {
      if (typeof routeRuleValue === "string" && routeRuleValue === user.role) {
        return true;
      }
      if (typeof routeRuleValue !== "string" && routeRuleValue.includes(user.role)) {
        return true;
      }
    });

    if (!routeRule) {
      redirectTo = redirectUnauthorizedTo.default || "/dashboard";
    }

    if (routeRule) {
      const [routeRuleKey] = routeRule;
      redirectTo = routeRuleKey;
    }
  }

  if (!allowedRoles.includes(user.role)) {
    return <Redirect to={redirectTo} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Redirect to={redirectTo} />;
  }
  return <SentryRoute {...rest} render={(props) => <Component {...props} />} />;
};

export default RestrictedChildRoute;
