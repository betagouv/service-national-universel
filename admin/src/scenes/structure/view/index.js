import React, { createContext, useEffect, useState } from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { SentryRoute } from "../../../sentry";

import api from "../../../services/api";
import DetailsV2 from "./detailsV2";
import Missions from "./missions";
import HistoricV2 from "./historyV2";
import Breadcrumbs from "../../../components/Breadcrumbs";

export const StructureContext = createContext(null);

export default function Index() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Structures", to: "/structure" }, { label: "Fiche de la structure" }]} />
      <Switch>
        <SentryRoute path="/structure/:id/missions" component={Missions} />
        <SentryRoute path="/structure/:id/historique" component={() => <HistoricV2 />} />
        <SentryRoute path="/structure/:id" component={() => <DetailsV2 />} />
      </Switch>
    </>
  );
}
