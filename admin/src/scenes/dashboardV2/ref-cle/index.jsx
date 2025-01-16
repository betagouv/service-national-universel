import React from "react";
import { Switch, useHistory, useLocation } from "react-router-dom";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { SentryRoute } from "../../../sentry";

import Accueil from "./Accueil";

export default function Index() {
  useDocumentTitle("Accueil");
  const location = useLocation();
  const history = useHistory();

  React.useEffect(() => {
    if (!location.pathname.includes("/accueil")) {
      history.push("/accueil");
    }
  }, [location]);

  return (
    <Switch>
      <SentryRoute path="/accueil" component={Accueil} />
    </Switch>
  );
}
