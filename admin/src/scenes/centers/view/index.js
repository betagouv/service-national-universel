import React, { useEffect, useState } from "react";
import { Switch, Route, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import api from "../../../services/api";
import Team from "./team";
import CenterInformations from "./CenterInformations";
import Nav from "./Nav";
import Youngs from "./youngs";
import Affectation from "./affectation";
import WaitingList from "./waitingList";
import { toastr } from "react-redux-toastr";
import { translate, CENTER_ROLES } from "../../../utils";

export default function Index({ ...props }) {
  const [center, setCenter] = useState();
  const [focusedCohort, setFocusedCohort] = useState();
  const [focusedSession, setFocusedSession] = useState();
  const [focusedTab, setFocusedTab] = useState("equipe");
  const [availableCohorts, setAvailableCohorts] = useState([]);
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  console.log(user);

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
      console.log("CENTER", centerResponse.data);
    })();
  }, [props.match.params.id]);

  useEffect(() => {
    if (!center) return;
    setFocusedCohort(center.cohorts[0]);
  }, [center]);

  useEffect(() => {
    (async () => {
      if (!center || !center?.cohorts || !center?.cohorts?.length || !focusedCohort) return;
      const allSessions = await api.get(`/cohesion-center/${center._id}/session-phase1`);
      if (!allSessions.ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des sessions", translate(allSessions.code));
      }
      setAvailableCohorts(allSessions.data.filter((session) => session.headCenterId === user._id).map((session) => session.cohort));
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

  const deleteTeamate = async (index) => {
    focusedSession.team.splice(index, 1);

    try {
      const r = await api.put(`/session-phase1/${focusedSession._id}`, { team: focusedSession.team });
      const { ok, data } = r;
      if (!ok) toastr.error("Oups, une erreur est survenue lors de la suppression du membre", translate(data.code));
      setFocusedSession(data);
      toastr.success("Succès", "Le membre a été supprimé de l'équipe");
    } catch (e) {
      console.log(e);
      toastr.error("Erreur !", translate(e.code));
    }
  };

  const addTeamate = async (teamate) => {
    let obj = {};

    if (teamate.role === CENTER_ROLES.chef) obj = await setChefCenter(teamate);
    else obj = await setTeamate(teamate);

    if (!Object.keys(obj).length) return;

    try {
      const { ok, data } = await api.put(`/session-phase1/${focusedSession._id}`, obj);
      if (!ok) toastr.error("Oups, une erreur est survenue lors de l'ajout du membre", translate(data.code));
      setFocusedSession(data);
      toastr.success("Succès", "Le membre a été ajouté à l'équipe");
    } catch (e) {
      console.log(e);
      toastr.error("Erreur !", translate(e.code));
    }
  };

  const setChefCenter = async (teamate) => {
    try {
      let { data: referent } = await api.get(`/referent?email=${teamate.email}`);

      if (!referent) {
        toastr.error("Erreur !", "Aucun utilisateur trouvé avec cette adresse email");
        return {};
      }

      return { headCenterId: referent._id };
    } catch (e) {
      toastr.error("Erreur !", translate(e));
    }
  };

  const setTeamate = async (teamate) => {
    const obj = { team: focusedSession.team };
    obj.team.push(teamate);
    return obj;
  };

  if (!center) return <div />;
  return (
    <>
      <CenterInformations center={center} />
      <div style={{ padding: "0 3rem" }}>
        <Nav
          tab={focusedTab}
          center={center}
          user={user}
          cohorts={availableCohorts}
          onChangeCohort={setFocusedCohort}
          onChangeTab={setFocusedTab}
          focusedSession={focusedSession}
        />
        <Switch>
          {/* liste-attente reliquat ? */}
          <Route path="/centre/:id/liste-attente" component={() => <WaitingList center={center} updateCenter={updateCenter} focusedCohort={focusedCohort} />} />
          {user.role !== "head_center" ? (
            <Route
              path="/centre/:id/volontaires"
              component={() => <Youngs center={center} updateCenter={updateCenter} focusedCohort={focusedCohort} focusedSession={focusedSession} />}
            />
          ) : null}
          <Route path="/centre/:id/affectation" component={() => <Affectation center={center} updateCenter={updateCenter} focusedCohort={focusedCohort} />} />
          <Route
            path="/centre/:id"
            component={() => (
              <>
                <Team center={center} focusedSession={focusedSession} deleteTeamate={deleteTeamate} addTeamate={addTeamate} />
              </>
            )}
          />
        </Switch>
      </div>
    </>
  );
}
