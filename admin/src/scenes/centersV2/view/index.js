import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import queryString from "query-string";

import api from "../../../services/api";
import CenterInformations from "./CenterInformations";
import { toastr } from "react-redux-toastr";
import { translate, ROLES } from "../../../utils";

import Breadcrumbs from "../../../components/Breadcrumbs";

export default function Index({ ...props }) {
  const history = useHistory();
  const { user, sessionPhase1: sessionPhase1Redux } = useSelector((state) => state.Auth);

  const [center, setCenter] = useState();
  const [sessions, setSessions] = useState([]);
  const [focusedCohort, setFocusedCohort] = useState();
  const [focusedSession, setFocusedSession] = useState();

  const [occupationPercentage, setOccupationPercentage] = useState();
  const [availableCohorts, setAvailableCohorts] = useState([]);
  const query = queryString.parse(location.search);
  const { cohorte: cohortQueryUrl } = query;

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

      if (!centerResponse.data || !centerResponse.data?.cohorts || !centerResponse.data?.cohorts?.length) return;

      let sessionsAdded = [];
      for (const cohort of centerResponse.data.cohorts) {
        const sessionPhase1Response = await api.get(`/cohesion-center/${id}/cohort/${cohort}/session-phase1`);
        if (!sessionPhase1Response.ok) return toastr.error("Oups, une erreur est survenue lors de la récupération de la session", translate(sessionPhase1Response.code));
        sessionsAdded.push(sessionPhase1Response.data);
      }
      setSessions(sessionsAdded);
    })();
  }, [props.match.params.id]);

  useEffect(() => {
    if (!center) return;
    // si on a une cohorte dans l'url , on la selectionne directement
    // -> sinon on a une session dans le redux, on la selectionne directement
    //    -> sinon on prend la première session du centre
    setFocusedCohort(cohortQueryUrl || sessionPhase1Redux?.cohort || center.cohorts[0]);
  }, [center]);

  useEffect(() => {
    setFocusedSession(sessions.find((e) => e.cohort === focusedCohort));
  }, [focusedCohort, sessions]);

  useEffect(() => {
    if (!focusedSession) return;
    const occupation = focusedSession.placesTotal ? (((focusedSession.placesTotal - focusedSession.placesLeft) * 100) / focusedSession.placesTotal).toFixed(2) : 0;
    setOccupationPercentage(occupation);
  }, [focusedSession]);

  useEffect(() => {
    (async () => {
      if (!center || !center?.cohorts || !center?.cohorts?.length) return;
      const allSessions = await api.get(`/cohesion-center/${center._id}/session-phase1`);
      if (!allSessions.ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des sessions", translate(allSessions.code));
      }
      if ([ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role)) {
        setAvailableCohorts(allSessions.data.map((s) => s.cohort));
      } else {
        setAvailableCohorts(allSessions.data.filter((session) => session.headCenterId === user._id).map((session) => session.cohort));
      }
    })();
  }, [center]);

  if (!center) return <div />;
  return (
    <>
      <Breadcrumbs items={[{ label: "Centres", to: "/centre" }, { label: "Fiche du centre" }]} />
      <CenterInformations center={center} setCenter={setCenter} sessions={sessions} />
    </>
  );
}
