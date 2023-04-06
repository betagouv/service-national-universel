import React from "react";
import { useSelector } from "react-redux";
import { Redirect, Switch } from "react-router-dom";
import { department2region, ROLES } from "snu-lib";
import { SentryRoute } from "../../../sentry";
import SchemaRepartition from "./SchemaRepartition";

export default function SchemaRepartitionIndex(props) {
  const region = props.match && props.match.params && props.match.params.region;
  const department = props.match && props.match.params && props.match.params.department;

  const user = useSelector((state) => state.Auth.user);

  const getRedirectionRoute = () => {
    if (user.role === ROLES.REFERENT_DEPARTMENT) {
      return `/schema-repartition/${department2region[user.department[0]]}/${user.department[0]}`;
    }
    if (user.role === ROLES.REFERENT_REGION) {
      return `/schema-repartition/${user.region}`;
    }
    return "/dashboard";
  };

  return (
    <Switch>
      <SentryRoute
        path="/schema-repartition/:region/:department"
        component={() => {
          const userDepartment = user.department.find((dep) => dep === department);

          if (![ROLES.ADMIN, ROLES.TRANSPORTER, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role)) {
            return <Redirect to={getRedirectionRoute()} />;
          }
          if (ROLES.REFERENT_DEPARTMENT === user.role && !userDepartment && department2region[userDepartment] !== region) {
            return <Redirect to={getRedirectionRoute()} />;
          }
          return <SchemaRepartition region={region} department={department} />;
        }}
      />
      <SentryRoute
        path="/schema-repartition/:region"
        component={() => {
          if (![ROLES.ADMIN, ROLES.TRANSPORTER, ROLES.REFERENT_REGION].includes(user.role)) {
            return <Redirect to={getRedirectionRoute()} />;
          }
          return <SchemaRepartition region={region} />;
        }}
      />
      <SentryRoute
        path="/schema-repartition"
        component={() => {
          if (![ROLES.ADMIN, ROLES.TRANSPORTER, ROLES.REFERENT_REGION].includes(user.role)) {
            return <Redirect to={getRedirectionRoute()} />;
          }
          return <SchemaRepartition />;
        }}
      />
    </Switch>
  );
}
