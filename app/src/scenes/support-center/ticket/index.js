import React from "react";
import { Switch, Route } from "react-router-dom";

import Create from "./create";
import View from "./view";

export default function TicketIndex() {
  return (
    <Switch>
      <Route path="/besoin-d-aide/ticket/:id" component={View} />
      <Route path="/besoin-d-aide/ticket" component={Create} />
    </Switch>
  );
}
