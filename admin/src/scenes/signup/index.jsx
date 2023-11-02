import React from "react";
import { Switch, Link } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

// DSFR Requirements
import "@codegouvfr/react-dsfr/dsfr/utility/icons/icons.min.css";
import "@codegouvfr/react-dsfr/dsfr/dsfr.min.css";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
startReactDsfr({ defaultColorScheme: "system", Link });

import Register from "./register";

export default function Index() {
  useDocumentTitle("Creer mon compte");

  return (
    <Switch>
      <SentryRoute path="/creer-mon-compte" component={Register} />
    </Switch>
  );
}
