import React from "react";
import { Switch, Route } from "react-router-dom";

import Create from "./create";
import View from "./view";

export default function Index({ fromPage }) {
  return (
    <Switch>
      <Route path="/besoin-d-aide/ticket/:id" component={View} fromPage={fromPage} />
      <Route path="/besoin-d-aide/ticket" component={Create} fromPage={fromPage} />
    </Switch>
  );
}
