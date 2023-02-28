import React from "react";
import { useSelector } from "react-redux";
import { Switch } from "react-router-dom";
import { department2region, ROLES } from "snu-lib";
import RestrictedChildRoute from "../../../utils/components/RestrictedChildRoute";
import SchemaRepartition from "./SchemaRepartition";

export default function SchemaRepartitionIndex(props) {
  const region = props.match && props.match.params && props.match.params.region;
  const department = props.match && props.match.params && props.match.params.department;

  const user = useSelector((state) => state.Auth.user);

  const redirectUnauthorizedToObject = {
    [`/schema-repartition/${user.region}`]: [ROLES.REFERENT_REGION],
    [`/schema-repartition/${department2region[user.department[0]]}/${user.department[0]}`]: ROLES.REFERENT_DEPARTMENT,
  };

  return (
    <Switch>
      <RestrictedChildRoute
        path="/schema-repartition/:region/:department"
        component={() => <SchemaRepartition region={region} department={department} />}
        restrictionRules={{
          $or: [
            [ROLES.ADMIN, ROLES.TRANSPORTER].includes(user.role),
            {
              $and: [ROLES.REFERENT_REGION === user.role, region === user.region],
            },
            {
              $and: [ROLES.REFERENT_DEPARTMENT === user.role, user.department.includes(department), department2region[department] === region],
            },
          ],
        }}
        redirectUnauthorizedTo={redirectUnauthorizedToObject}
      />
      <RestrictedChildRoute
        path="/schema-repartition/:region"
        component={() => <SchemaRepartition region={region} />}
        restrictionRules={{
          $or: [
            [ROLES.ADMIN, ROLES.TRANSPORTER].includes(user.role),
            {
              $and: [ROLES.REFERENT_REGION === user.role, region === user.region],
            },
          ],
        }}
        redirectUnauthorizedTo={redirectUnauthorizedToObject}
      />
      <RestrictedChildRoute
        path="/schema-repartition"
        component={() => <SchemaRepartition />}
        restrictionRules={[ROLES.ADMIN, ROLES.TRANSPORTER].includes(user.role)}
        redirectUnauthorizedTo={redirectUnauthorizedToObject}
      />
    </Switch>
  );
}
