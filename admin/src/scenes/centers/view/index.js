import React, { useEffect, useState } from "react";
import { Switch, Route, useHistory } from "react-router-dom";

import api from "../../../services/api";
import Team from "./team";
import CenterInformations from "./CenterInformations";
import Nav from "./Nav";
import Youngs from "./youngs";
import Affectation from "./affectation";
import WaitingList from "./waitingList";
import { toastr } from "react-redux-toastr";
import { translate } from "../../../utils";

export default function Index({ ...props }) {
  const [center, setCenter] = useState();
  const [focusedCohort, setFocusedCohort] = useState();
  const [focusedSession, setFocusedSession] = useState();
  const [focusedTab, setFocusedTab] = useState("equipe");
  const history = useHistory();

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;

      const centerResponse = await api.get(`/cohesion-center/${id}`);
      if (!centerResponse.ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération de la mission", translate(centerResponse.code));
        return history.push("/center");
      }
      setCenter(centerResponse.data);
    })();
  }, [props.match.params.id]);

  useEffect(() => {
    if (!center) return;
    setFocusedCohort(center.cohorts[0]);
  }, [center]);

  useEffect(() => {
    (async () => {
      if (!center || !center?.cohorts || !center?.cohorts?.length || !focusedCohort) return;
      const sessionPhase1 = await api.get(`/cohesion-center/${center._id}/cohort/${focusedCohort}/session-phase1`);
      if (!sessionPhase1.ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération de la session", translate(sessionPhase1.code));
      }
      setFocusedSession(sessionPhase1.data);
    })();
  }, [center, focusedCohort]);

  const updateCenter = async () => {
    const { data, ok } = await api.get(`/cohesion-center/${center._id}`);
    if (ok) setCenter(data);
  };

  if (!center) return <div />;
  return (
    <>
      <CenterInformations center={center} />
      <div style={{ padding: "0 3rem" }}>
        <Nav tab={focusedTab} center={center} onChangeCohort={setFocusedCohort} onChangeTab={setFocusedTab} />
        <Switch>
          {/* liste-attente reliquat ? */}
          <Route path="/centre/:id/liste-attente" component={() => <WaitingList center={center} updateCenter={updateCenter} focusedCohort={focusedCohort} />} />
          <Route
            path="/centre/:id/volontaires"
            component={() => <Youngs center={center} updateCenter={updateCenter} focusedCohort={focusedCohort} focusedSession={focusedSession} />}
          />
          <Route path="/centre/:id/affectation" component={() => <Affectation center={center} updateCenter={updateCenter} focusedCohort={focusedCohort} />} />
          <Route
            path="/centre/:id"
            component={() => (
              <>
                <Team center={center} focusedCohort={focusedCohort} />
              </>
            )}
          />
        </Switch>
      </div>
    </>
  );
}
