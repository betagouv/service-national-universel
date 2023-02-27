import React from "react";
import { Switch, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import List from "./list";
import ViewDesktop from "./viewDesktop";
import ViewMobile from "./viewMobile";
import { permissionPhase2 } from "../../utils";
import { SentryRoute } from "../../sentry";
import useDevice from "../../hooks/useDevice";

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const device = useDevice();

  if (!young || !permissionPhase2(young)) history.push("/");

  const getMissionView = () => {
    if (device === "desktop") return <ViewDesktop />;
    else return <ViewMobile />;
  };

  return (
    <Switch>
      <SentryRoute path="/mission/:id" component={getMissionView} />
      <SentryRoute path="/mission" component={List} />
    </Switch>
  );
}
