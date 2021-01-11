import React from "react";
import { Switch, Route } from "react-router-dom";

import List from "./list";
import Edit from "./edit";

export default () => {
  return (
    <Switch>
      <Route path="/mission/create" component={Edit} />
      <Route path="/mission/:id" component={Edit} />
      <Route path="/mission" component={List} />
    </Switch>
  );
};
