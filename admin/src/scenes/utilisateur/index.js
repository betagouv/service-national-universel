import React from "react";
import { Switch, Route } from "react-router-dom";

import Edit from "./edit";
import List from "./list";

export default function User() {
  return (
    <Switch>
      <Route path="/user/:id" component={Edit} />
      <Route path="/user" component={List} />
    </Switch>
  );
}
