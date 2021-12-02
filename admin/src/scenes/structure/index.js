import React from "react";
import { Switch, Route } from "react-router-dom";

import View from "./view";
import Edit from "./edit";
import List from "./list";
import Create from "./create";

export default function Index() {
  return (
    <Switch>
      <Route path="/structure/create" component={Create} />
      <Route path="/structure/:id/edit" component={Edit} />
      <Route path="/structure/:id" component={View} />
      <Route path="/structure" component={List} />
    </Switch>
  );
}
