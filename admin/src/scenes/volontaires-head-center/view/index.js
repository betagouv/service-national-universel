import React, { useEffect, useState } from "react";
import { Switch } from "react-router-dom";
import { SentryRoute } from "../../../sentry";

import api from "../../../services/api";
import VolontairePhase0View from "../../phase0/view";
import Phase1 from "../../volontaires/view/phase1";

import Breadcrumbs from "../../../components/Breadcrumbs";

export default function VolontaireHeadCenter({ ...props }) {
  const [young, setYoung] = useState();

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      const { data } = await api.get(`/referent/young/${id}`);
      setYoung(data);
    })();
  }, [props.match.params.id]);

  if (!young) return <div />;
  return (
    <Switch>
      <SentryRoute
        path="/volontaire/:id/phase1"
        component={() => (
          <>
            <Breadcrumbs items={[{ label: "Volontaires", to: "/volontaire" }, { label: "Fiche du volontaire" }]} />
            <Phase1 young={young} />
          </>
        )}
      />
      <SentryRoute
        path="/volontaire/:id"
        component={() => (
          <>
            <Breadcrumbs items={[{ label: "Volontaires", to: "/volontaire" }, { label: "Fiche du volontaire" }]} />
            <VolontairePhase0View young={young} globalMode="readonly" />
          </>
        )}
      />
    </Switch>
  );
}
