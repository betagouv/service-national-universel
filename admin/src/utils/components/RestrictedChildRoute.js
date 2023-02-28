import React from "react";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { SentryRoute } from "../../sentry";

const validateRestrictionRules = (restrictionRules) => {
  if (typeof restrictionRules === "boolean") {
    return restrictionRules;
  }

  const [restrictionOperator] = Object.keys(restrictionRules);

  if (!restrictionRules || !restrictionOperator) {
    return true;
  }

  let finalCondition = false;

  for (const rule of restrictionRules[restrictionOperator]) {
    if (typeof rule !== "boolean" && "$and" in rule === false && "$or" in rule === false) {
      throw new Error("RESTRICTION ROUTE VALIDATION ERROR: Please set valid rules using boolean or operators ('$and' or '$or').");
    }

    if (typeof rule === "boolean") {
      if (restrictionOperator === "$or") {
        if (rule) {
          finalCondition = true;
          break;
        }
      } else if (restrictionOperator === "$and") {
        finalCondition = true;
        if (!rule) {
          finalCondition = false;
          break;
        }
      }
    } else {
      const nestedCondition = validateRestrictionRules(rule);
      if (restrictionOperator === "$or") {
        finalCondition = finalCondition || nestedCondition;
        if (finalCondition) {
          break;
        }
      }
      if (restrictionOperator === "$and") {
        finalCondition = finalCondition && nestedCondition;
        if (!finalCondition) {
          break;
        }
      }
    }
  }

  return finalCondition;
};

const RestrictedChildRoute = ({ component: Component, redirectUnauthorizedTo = "/dashboard", restrictionRules = true, ...rest }) => {
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

  const areRestrictionRulesPassing = validateRestrictionRules(restrictionRules);

  if (!areRestrictionRulesPassing) {
    return <Redirect to={redirectTo} />;
  }

  return <SentryRoute {...rest} render={(props) => <Component {...props} />} />;
};

export default RestrictedChildRoute;
