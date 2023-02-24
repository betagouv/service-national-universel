import React from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

import Test from "./test";
import Test_custom from "./test_customQuery";
import Test_volontaire from "./test_volontaire.js";
import Test_Component from "./test_customComponent";

export default function User() {
  useDocumentTitle("Utilisateurs");

  return (
    <Switch>
      <SentryRoute path="/filters/volontaire" component={Test_volontaire} />
      <SentryRoute path="/filters/custom" component={Test_custom} />
      <SentryRoute path="/filters/customComponent" component={Test_Component} />
      <SentryRoute path="/filters" component={Test} />
    </Switch>
  );
}
