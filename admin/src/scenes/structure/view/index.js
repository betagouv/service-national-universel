import React from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../../sentry";

import Breadcrumbs from "../../../components/Breadcrumbs";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import DetailsV2 from "./detailsV2";
import HistoricV2 from "./historyV2";
import Missions from "./missions";

export default function Index() {
  useDocumentTitle("Structures");
  return (
    <>
      <Breadcrumbs items={[{ label: "Structures", to: "/structure" }, { label: "Fiche de la structure" }]} />
      <Switch>
        <SentryRoute path="/structure/:id/missions" component={Missions} />
        <SentryRoute path="/structure/:id/historique" component={HistoricV2} />
        <SentryRoute path="/structure/:id" component={DetailsV2} />
      </Switch>
    </>
  );
}
