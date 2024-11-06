import React, { useEffect, useState } from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../../sentry";

import Phase2Contract from "./phase2Contract";

import api from "../../../services/api";
import Application from "./application";

export default function VolontaireResponsible({ ...props }) {
  const [young, setYoung] = useState();

  const getYoung = async () => {
    const id = props.match && props.match.params && props.match.params.id;
    if (!id) return <div />;
    const { data } = await api.get(`/referent/young/${id}`);
    setYoung(data);
  };

  useEffect(() => {
    getYoung();
  }, [props.match.params.id]);

  if (!young) return <div />;
  return (
    <Switch>
      <SentryRoute path="/volontaire/:id/phase2/application/:applicationId/contrat" component={() => <Phase2Contract young={young} onChange={getYoung} />} />
      <SentryRoute path="/volontaire/:id/phase2/application/:applicationId/dossier" component={() => <Application young={young} onChange={getYoung} currentTab="dossier" />} />
      <SentryRoute path="/volontaire/:id/phase2/application/:applicationId" exact component={() => <Application young={young} onChange={getYoung} />} />
    </Switch>
  );
}
