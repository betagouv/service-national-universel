import React from "react";
import { Switch, Link } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { SentryRoute } from "../../sentry";

// DSFR Requirements
import "@codegouvfr/react-dsfr/dsfr/utility/icons/icons.min.css";
import "@codegouvfr/react-dsfr/dsfr/dsfr.min.css";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
startReactDsfr({ defaultColorScheme: "light", Link });

import Role from "./role";
import Email from "./email";
import Code from "./code";
import Informations from "./informations";
import Confirmation from "./confirmation";

export default function Index() {
  useDocumentTitle("Creer mon compte");

  return (
    <Switch>
      <SentryRoute path="/creer-mon-compte/role" component={Role} />
      <SentryRoute path="/creer-mon-compte/email" component={Email} />
      <SentryRoute path="/creer-mon-compte/code" component={Code} />
      <SentryRoute path="/creer-mon-compte/informations" component={Informations} />
      <SentryRoute path="/creer-mon-compte/confirmation" component={Confirmation} />
    </Switch>
  );
}
