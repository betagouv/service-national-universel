import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";
import useDocumentTitle from "../../../hooks/useDocumentTitle";

import api from "../../../services/api";
import Details from "./details";
import Phase1 from "./phase1";
import Phase2 from "./phase2";
import Phase3 from "./phase3";
import Phase2Contract from "./phase2Contract";
import History from "./history";

export default function Index({ ...props }) {
  const [young, setYoung] = useState();
  const setDocumentTitle = useDocumentTitle("Volontaires");

  const getYoung = async () => {
    const id = props.match && props.match.params && props.match.params.id;
    if (!id) return <div />;
    const { data } = await api.get(`/referent/young/${id}`);
    setYoung(data);
    setDocumentTitle(`${data.firstName} ${data.lastName}`);
  };

  useEffect(() => {
    getYoung();
  }, [props.match.params.id]);

  if (!young) return <div />;
  return (
    <Switch>
      <Route path="/volontaire/:id/phase1" component={() => <Phase1 young={young} getYoung={getYoung} onChange={getYoung} />} />
      <Route path="/volontaire/:id/phase2/application/:applicationId/contrat" component={() => <Phase2Contract young={young} onChange={getYoung} />} />
      <Route path="/volontaire/:id/phase2" component={() => <Phase2 young={young} onChange={getYoung} />} />
      <Route path="/volontaire/:id/phase3" component={() => <Phase3 young={young} onChange={getYoung} />} />
      <Route path="/volontaire/:id/historique" component={() => <History young={young} onChange={getYoung} />} />
      <Route path="/volontaire/:id" component={() => <Details young={young} onChange={getYoung} />} />
    </Switch>
  );
}
