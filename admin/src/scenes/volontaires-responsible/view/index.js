import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";
import Phase2Contract from "./phase2Contract";

import api from "../../../services/api";
import Details from "../../../components/volontaires-view/Details";
import Wrapper from "./wrapper";

export default ({ ...props }) => {
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
      <Route path="/volontaire/:id/phase2/application/:applicationId/contrat" component={() => <Phase2Contract young={young} onChange={getYoung} />} />
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
};
