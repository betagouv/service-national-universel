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

export default function Index({ ...props }) {
  const setDocumentTitle = useDocumentTitle("Structures");
  const [structure, setStructure] = useState();

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      const { data } = await api.get(`/structure/${id}`);
      setDocumentTitle(`${data?.name}`);
      setStructure(data);
    })();
  }, [props.match.params.id]);

  if (!structure) return <div />;
  return (
    <StructureContext.Provider value={{ structure, setStructure }}>
      <Breadcrumbs items={[{ label: "Structures", to: "/structure" }, { label: "Fiche de la structure" }]} />
      <Switch>
        <SentryRoute path="/structure/:id/missions" component={() => <Missions structure={structure} />} />
        <SentryRoute path="/structure/:id/historique" component={() => <HistoricV2 />} />
        <SentryRoute path="/structure/:id" component={() => <DetailsV2 />} />
      </Switch>
    </StructureContext.Provider>
  );
}
