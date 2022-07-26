import React from "react";
import { Switch, useHistory } from "react-router-dom";
import { permissionPhase3 } from "../../utils";
import { useSelector } from "react-redux";

import Home from "./home";
import Missions from "./missions";
import Mission from "./mission";
import Valider from "./valider";
import { SentryRoute } from "../../sentry";

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  if (!young || !permissionPhase3(young)) history.push("/");

  return (
    <div>
      <Switch>
        <SentryRoute path="/phase3/valider" component={Valider} />
        <SentryRoute path="/phase3/mission/:id" component={Mission} />
        <SentryRoute path="/phase3/mission" component={Missions} />
        <SentryRoute path="/phase3" component={Home} />
      </Switch>
    </div>
  );
}
