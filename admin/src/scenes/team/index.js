import React from "react";
import { Switch, Route } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import List from "./list";

export default function Team() {
  useDocumentTitle("Mon équipe");

  return (
    <Switch>
      <Route path="/equipe" component={List} />
    </Switch>
  );
}
