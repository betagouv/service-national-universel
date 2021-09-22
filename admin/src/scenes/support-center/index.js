import React from "react";
import { Switch, Route } from "react-router-dom";

import Dashboard from "./dashboard";
import Ticket from "./ticket";

export default () => {
  return (
    <Switch>
      <Route path="/support/ticket" component={Ticket} />
      <Route path="/support" component={Dashboard} />
    </Switch>
  );
};
