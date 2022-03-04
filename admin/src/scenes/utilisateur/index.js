import React from "react";
import { Switch, Route } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import Edit from "./edit";
import List from "./list";

export default function User() {
  useDocumentTitle("Utilisateurs");

  return (
    <Switch>
      <Route path="/user/:id" component={Edit} />
      <Route path="/user" component={List} />
    </Switch>
  );
}
