import React from "react";
import { Switch, Route } from "react-router-dom";

import Create from "./create";
import View from "./view";

export default () => {
  return (
    <Switch>
      <Route path="/support/ticket/:id" component={View} />
      <Route path="/support/ticket" component={Create} />
    </Switch>
  );
};
