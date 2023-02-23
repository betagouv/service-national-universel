import React from "react";
import { Switch } from "react-router-dom";
import { ROLES } from "snu-lib";
import { SentryRoute } from "../../../sentry";
import RestrictedChildRoute from "../../../utils/components/RestrictedChildRoute";
import SchemaRepartition from "./SchemaRepartition";

export default function SchemaRepartitionIndex(props) {
  const region = props.match && props.match.params && props.match.params.region;
  const department = props.match && props.match.params && props.match.params.department;

  return (
    <Switch>
      <SentryRoute path="/schema-repartition/:region/:department" component={() => <SchemaRepartition region={region} department={department} />} />
      <SentryRoute path="/schema-repartition/:region" component={() => <SchemaRepartition region={region} />} />
      <RestrictedChildRoute path="/schema-repartition" component={() => <SchemaRepartition />} roles={[ROLES.ADMIN, ROLES.TRANSPORTER]} />
    </Switch>
  );
}
