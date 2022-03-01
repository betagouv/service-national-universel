import React from "react";
import { Switch, Route } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import List from "./list";
import Edit from "./edit";
import View from "./view";

export default function CenterIndex() {
  useDocumentTitle("Centres");

  return (
    <Switch>
      <Route path="/centre/nouveau" component={Edit} />
      <Route path="/centre/:id/edit" component={Edit} />
      <Route path="/centre/:id" component={View} />
      <Route path="/centre" component={List} />
    </Switch>
  );
}
