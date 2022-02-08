import React from "react";
import { Switch, Route } from "react-router-dom";

import List from "./list";

export default function Index() {
  return (
    <Switch>
      <Route path="/association" component={List} />
    </Switch>
  );
}
