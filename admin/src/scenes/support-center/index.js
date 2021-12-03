import React from "react";
import { Switch, Route } from "react-router-dom";

import Dashboard from "./dashboard";
import Ticket from "./ticket";

export default function SupportCenter() {
  return (
    <Switch>
      <Route path="/besoin-d-aide/ticket" component={Ticket} />
      <Route path="/besoin-d-aide" component={Dashboard} />
    </Switch>
  );
}
