import React, { useEffect, useState } from "react";
import { Switch, Route } from "react-router-dom";
import Phase2Contract from "./phase2Contract";
import Phase2MilitaryPreparation from "./phase2MilitaryPreparation";

import api from "../../../services/api";
import Details from "../../../components/volontaires-view/Details";
import Wrapper from "./wrapper";
import { ENABLE_PM } from "../../../utils";

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
      {ENABLE_PM && (
        <Route
          path="/volontaire/:id/preparation-militaire"
          component={() => (
            <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
              <Wrapper young={young} tab="militaryPreparation">
                <Phase2MilitaryPreparation young={young} />
              </Wrapper>
            </div>
          )}
        />
      )}
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
