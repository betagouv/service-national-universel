import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";

import api from "../../../services/api";
import Details from "../../../components/volontaires-view/Details";
import Wrapper from "./wrapper";
import Phase1 from "./phase1";

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
      <Route path="/volontaire/:id/phase1" component={() => <Phase1 young={young} />} />
      <Route
        path="/volontaire/:id"
        component={() => (
          <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
            <Wrapper young={young} tab="details">
              <Details young={young} />
            </Wrapper>
          </div>
        )}
      />
    </Switch>
  );
}
