import React from "react";
import { Switch, Route } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import Edit from "./edit";
import List from "./list";
import View from "./view";
import Create from "./create";

export default function Index() {
  useDocumentTitle("Volontaires");

  return (
    <Switch>
      <Route path="/volontaire/create" component={Create} />
      <Route path="/volontaire/:id/edit" component={Edit} />
      <Route path="/volontaire/:id" component={View} />
      <Route path="/volontaire" component={List} />
    </Switch>
  );
}
