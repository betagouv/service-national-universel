import React, { useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import queryString from "query-string";

import api from "../../../services/api";
import CenterInformations from "./CenterInformations";
import { toastr } from "react-redux-toastr";
import { translate, ROLES, canCreateOrUpdateCohesionCenter, canSearchInElasticSearch } from "../../../utils";
import Plus from "../../../assets/icons/Plus.js";
import ChevronRight from "../../../assets/icons/ChevronRight.js";
import Template from "../../../assets/icons/Template.js";

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
    console.log(center);
    setFocusedCohort(cohortQueryUrl || sessionPhase1Redux?.cohort || center.cohorts[0]);
  }, [center]);

  useEffect(() => {
    setFocusedSession(sessions.find((e) => e.cohort === focusedCohort));
    console.log("ici ?");
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

  const updateCenter = async () => {
    const { data, ok } = await api.get(`/cohesion-center/${center._id}`);
    if (ok) setCenter(data);
  };

  const OccupationCard = ({ occupationPercentage, placesLeft, placesTotal }) => {
    let height = `h-0`;
    if (occupationPercentage < 20) height = "h-[20%]";
    else if (occupationPercentage < 30) height = "h-[30%]";
    else if (occupationPercentage < 40) height = "h-[40%]";
    else if (occupationPercentage < 50) height = "h-[50%]";
    else if (occupationPercentage < 60) height = "h-[60%]";
    else if (occupationPercentage < 70) height = "h-[70%]";
    else if (occupationPercentage < 80) height = "h-[80%]";
    else if (occupationPercentage < 100) height = "h-[90%]";
    else if (occupationPercentage >= 100) height = "h-[100%]";

    let bgColor = "bg-snu-purple-300";
    if (occupationPercentage > 100) bgColor = "bg-red-500";

    return occupationPercentage ? (
      <div className="bg-white rounded-lg shadow-sm py-4 px-8 max-w-xl">
        <div className="text-lg font-medium mb-1 text-gray-900">Taux d&apos;occupation</div>
        <div className="flex gap-4">
          {/* barre */}
          <div className="flex flex-col justify-end w-9 h-[100px] bg-gray-200 rounded-lg overflow-hidden">
            <div className={`flex justify-center items-center w-9 ${height} ${bgColor} rounded-lg text-white font-bold text-xs`}>{Math.floor(occupationPercentage)}%</div>
          </div>
          {/* nombres */}
          <div className="flex flex-col justify-around">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-200" />
              <div>
                <div className="text-xs font-normal">Place libres</div>
                <div className="text-base font-bold">{placesLeft}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-snu-purple-300" />
              <div>
                <div className="text-xs font-normal">Place occupées</div>
                <div className="text-base font-bold">{placesTotal - placesLeft}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null;
  };

  if (!center) return <div />;
  return (
    <>
      <div className="flex gap-3 text-gray-400 items-center ml-12 mt-8">
        <Template className="" />
        <ChevronRight className="" />
        {canSearchInElasticSearch(user, "cohesioncenter") ? (
          <Link className="text-xs hover:underline hover:text-snu-purple-300" to="/centre">
            Centres
          </Link>
        ) : (
          <div className="text-xs">Centres</div>
        )}
        <ChevronRight className="" />
        <div className="text-xs">Fiche du centre</div>
      </div>
      <CenterInformations data={center} setData={setCenter} sessions={sessions} />
    </>
  );
}
