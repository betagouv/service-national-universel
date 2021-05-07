import React from "react";
import { Switch, Route } from "react-router-dom";

import List from "./list";
import Edit from "./edit";
import View from "./view";

export default () => {
  return (
    <Switch>
      <Route path="/centre/create" component={Edit} />
      <Route path="/centre/:id/edit" component={Edit} />
      <Route path="/centre/:id" component={View} />
      <Route path="/centre" component={List} />
    </Switch>
  );
};
