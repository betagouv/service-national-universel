import React from "react";
import { Switch, useHistory, useLocation } from "react-router-dom";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { SentryRoute } from "../../../sentry";

import General from "../components/General";
import Sejour from "./subscenes/sejour";

export default function Index() {
  useDocumentTitle("Tableau de bord");
  const location = useLocation();
  const history = useHistory();

  React.useEffect(() => {
    if (!location.pathname.includes("/dashboard")) {
      history.push("/dashboard");
    }
  }, [location]);

  return (
    <Switch>
      <SentryRoute path="/dashboard/sejour" component={Sejour} />
      <SentryRoute path="/dashboard" component={General} />
    </Switch>
  );
}
