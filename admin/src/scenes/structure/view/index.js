import React, { createContext, useEffect, useState } from "react";
import { Switch } from "react-router-dom";
import useDocumentTitle from "../../../hooks/useDocumentTitle";
import { SentryRoute } from "../../../sentry";

import api from "../../../services/api";
import Details from "./details";
import DetailsV2 from "./detailsV2";
import Missions from "./missions";
import Historic from "./history";
import Breadcrumbs from "../../../components/Breadcrumbs";
import { environment } from "../../../config";

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
        <SentryRoute path="/structure/:id/historique" component={() => <Historic structure={structure} />} />
        <SentryRoute path="/structure/:id" component={["staging", "development"].includes(environment) ? DetailsV2 : Details} />
      </Switch>
    </StructureContext.Provider>
  );
}
