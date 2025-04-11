import React from "react";
import { Redirect, Switch, useHistory } from "react-router-dom";
import useAuth from "@/services/useAuth";

import List from "./list";
import ViewDesktop from "./viewDesktop";
import ViewMobile from "./viewMobile";
import usePermissions from "@/hooks/usePermissions";
import { SentryRoute } from "../../sentry";
import useDevice from "../../hooks/useDevice";

export default function Index() {
  const { young } = useAuth();
  const { canApplyToPhase2 } = usePermissions();
  const history = useHistory();
  const device = useDevice();

  if (!young || !canApplyToPhase2) history.push("/");

  const getMissionView = () => {
    if (device === "desktop") return <ViewDesktop />;
    else return <ViewMobile />;
  };

  return (
    <Switch>
      <SentryRoute
        path="/mission/:id"
        render={({ match }) => {
          const { id } = match.params;
          if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return <Redirect to="/mission" />;
          }
          return <SentryRoute component={getMissionView} />;
        }}
      />
      <SentryRoute path="/mission" component={List} />
    </Switch>
  );
}
