import React from "react";
import { Switch, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import List from "./list";
import ViewDesktop from "./viewDesktop";
import ViewMobile from "./viewMobile";
import { permissionPhase2 } from "../../utils";
import { SentryRoute } from "../../sentry";
import useMobileSwitch from "../../hooks/useMobileSwitch";

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  if (!young || !permissionPhase2(young)) history.push("/");

  const getMissionView = () => {
    return useMobileSwitch(ViewMobile, ViewDesktop);
  };

  return (
    <Switch>
      <SentryRoute path="/mission/:id" component={getMissionView} />
      <SentryRoute path="/mission" component={List} />
    </Switch>
  );
}
