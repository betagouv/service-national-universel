import React from "react";
import { Switch, Route } from "react-router-dom";

import Home from "./home";
import Engagement from "./engagement";
import Missions from "./missions";
import Mission from "./mission";
import Valider from "./valider";
import { environment } from "../../config";

export default () => {
  //todo : remove when ready
  if (environment === "production") return <div style={{ padding: "3rem", fontStyle: "italic" }}>Bientôt disponible !</div>;

  return (
    <div>
      <Switch>
        <Route path="/phase3/valider" component={Valider} />
        <Route path="/phase3/mission/:id" component={Mission} />
        <Route path="/phase3/mission" component={Missions} />
        <Route path="/phase3/les-programmes" component={Engagement} />
        <Route path="/phase3" component={Home} />
      </Switch>
    </div>
  );
};
