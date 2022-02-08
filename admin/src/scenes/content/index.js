import React from "react";
import { Switch, Route } from "react-router-dom";

import List from "./list";
import Edit from "./edit";

export default function Index() {
  return (
    <Switch>
      <Route path="/contenu/create" component={Edit} />
      <Route path="/contenu/:id/edit" component={Edit} />
      <Route path="/contenu" component={List} />
    </Switch>
  );
}
