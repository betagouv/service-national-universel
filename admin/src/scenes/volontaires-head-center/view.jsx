import React, { useEffect, useState } from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../sentry";

import api from "../../services/api";
import VolontairePhase0View from "../phase0/view";
import Phase1 from "../volontaires/view/phase1";

import Breadcrumbs from "../../components/Breadcrumbs";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function VolontaireHeadCenter({ ...props }) {
  const [young, setYoung] = useState();
  useDocumentTitle(young ? `${young.firstName} ${young.lastName}` : "Volontaires");

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
    <>
      <Breadcrumbs items={[{ label: "Volontaires", to: `/centre/${young.cohesionCenterId}/${young.sessionPhase1Id}/general` }, { label: "Fiche du volontaire" }]} />
      <Switch>
        <SentryRoute path="/volontaire/:id/phase1" component={() => <Phase1 young={young} />} />
        <SentryRoute path="/volontaire/:id" component={() => <VolontairePhase0View young={young} globalMode="readonly" onChange={getYoung} />} />
      </Switch>
    </>
  );
}
