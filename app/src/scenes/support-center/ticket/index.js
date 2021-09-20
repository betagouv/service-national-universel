import React from "react";
import { Switch, Route } from "react-router-dom";

import List from "./list";
import View from "./view";

export default () => {
  return (
    <Switch>
      <Route path="/ticket/:id" component={View} />
      <Route path="/ticket" component={List} />
    </Switch>
  );
};
