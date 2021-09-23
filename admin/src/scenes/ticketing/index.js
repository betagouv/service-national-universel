import React from "react";
import { Switch, Route } from "react-router-dom";

import Dashboard from "./dashboard";

export default () => {
  return (
    <Switch>
      <Route path="/ticket" component={Dashboard} />
    </Switch>
  );
};
