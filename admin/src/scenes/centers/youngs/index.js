import React from "react";
import { Switch, Route } from "react-router-dom";
import useDocumentTitle from "../../../hooks/useDocumentTitle";

import List from "./list";

export default function CenterIndex() {
  useDocumentTitle("Centres");

  return (
    <Switch>
      <Route path="/centre/:id/:sessionId/volontaires" component={List} />
    </Switch>
  );
}
