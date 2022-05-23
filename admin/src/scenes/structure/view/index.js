import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";
import useDocumentTitle from "../../../hooks/useDocumentTitle";

import api from "../../../services/api";
import Details from "./details";
import Missions from "./missions";
import Historic from "./history";
import Breadcrumbs from "../../../components/Breadcrumbs";

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
    <>
      <Breadcrumbs items={[{ label: "Structures", to: "/structure" }, { label: "Fiche de la structure" }]} />
      <Switch>
        <Route path="/structure/:id/missions" component={() => <Missions structure={structure} />} />
        <Route path="/structure/:id/historique" component={() => <Historic structure={structure} />} />
        <Route path="/structure/:id" component={() => <Details structure={structure} />} />
      </Switch>
    </>
  );
}
