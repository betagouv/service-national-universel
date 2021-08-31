import React from "react";
import { Switch, Route } from "react-router-dom";
import { permissionPhase3 } from "../../utils";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import Home from "./home";
import Missions from "./missions";
import Mission from "./mission";
import Valider from "./valider";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  if (!young || !permissionPhase3(young)) history.push("/");

  return (
    <div>
      <Switch>
        <Route path="/phase3/valider" component={Valider} />
        <Route path="/phase3/mission/:id" component={Mission} />
        <Route path="/phase3/mission" component={Missions} />
        <Route path="/phase3" component={Home} />
      </Switch>
    </div>
  );
};
