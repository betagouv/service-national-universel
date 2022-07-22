import React from "react";
import { Switch, Route } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

import List from "./list";

export default function Index() {
  useDocumentTitle("Associations");

  return (
    <Switch>
      <Route path="/association" component={List} />
    </Switch>
  );
}
