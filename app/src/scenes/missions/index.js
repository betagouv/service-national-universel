import React from "react";
import { Switch, Route } from "react-router-dom";

import List from "./list";
import View from "./view";

export default () => {
  return (
    <Switch>
      <Route path="/mission/:id" component={View} />
      <Route path="/mission" component={List} />
    </Switch>
  );
};
