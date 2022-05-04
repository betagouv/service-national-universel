import React from "react";
import { Switch, Route } from "react-router-dom";
import useDocumentTitle from "../../../hooks/useDocumentTitle";

import List from "./list";
import { environment } from "../../../config";

export default function CenterIndex() {
  useDocumentTitle("Centres");

  if (environment !== "production") return null;

  return (
    <Switch>
      <Route path="/centre/:id/:sessionId/volontaires" component={List} />
    </Switch>
  );
}
