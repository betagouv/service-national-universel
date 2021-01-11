import React from "react";
import { Switch, Route } from "react-router-dom";

import View from "./view";
import Edit from "./edit";
import List from "./list";

export default () => {
  return (
    <Switch>
      <Route path="/structure/edit" component={Edit} />
      <Route path="/structure/view" component={View} />
      <Route path="/structure" component={List} />
    </Switch>
  );
};
