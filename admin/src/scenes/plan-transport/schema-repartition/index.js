import React from "react";
import { useSelector } from "react-redux";
import { Switch } from "react-router-dom";
import { ROLES } from "snu-lib";
import { SentryRoute } from "../../../sentry";
import RestrictedChildRoute from "../../../utils/components/RestrictedChildRoute";
import SchemaRepartition from "./SchemaRepartition";

export default function SchemaRepartitionIndex(props) {
  const region = props.match && props.match.params && props.match.params.region;
  const department = props.match && props.match.params && props.match.params.department;

  const user = useSelector((state) => state.Auth.user);

  const redirectUnauthorizedToObject = {
    [`/schema-repartition/${user.region}`]: [ROLES.REFERENT_REGION],
    [`/schema-repartition/${user.region}/${user.department}`]: ROLES.REFERENT_DEPARTMENT,
  };

  return (
    <Switch>
      <SentryRoute path="/schema-repartition/:region/:department" component={() => <SchemaRepartition region={region} department={department} />} />
      <SentryRoute path="/schema-repartition/:region" component={() => <SchemaRepartition region={region} />} />
      <RestrictedChildRoute
        path="/schema-repartition"
        component={() => <SchemaRepartition />}
        allowedRoles={[ROLES.ADMIN, ROLES.TRANSPORTER]}
        redirectUnauthorizedTo={redirectUnauthorizedToObject}
      />
    </Switch>
  );
}
