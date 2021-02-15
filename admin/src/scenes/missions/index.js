import React from "react";
import { Switch, Route } from "react-router-dom";

import List from "./list";
import Edit from "./edit";
import View from "./view";

export default () => {
  return (
    <Switch>
      <Route path="/mission/create" component={() => <Edit isNew={true} />} />
      <Route path="/mission/:id/edit" component={Edit} />
      <Route path="/mission/:id" component={View} />
      <Route path="/mission" component={List} />
    </Switch>
  );
};
