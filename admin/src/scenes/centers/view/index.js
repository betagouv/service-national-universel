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
import { translate, ROLES } from "../../../utils";
import { environment } from "../../../config";

export default function Index({ ...props }) {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);

  const [center, setCenter] = useState();
  const [sessions, setSessions] = useState([]);
  const [focusedCohort, setFocusedCohort] = useState();
  const [focusedSession, setFocusedSession] = useState();
  const [focusedTab, setFocusedTab] = useState("equipe");
  const [occupationPercentage, setOccupationPercentage] = useState();
  const [availableCohorts, setAvailableCohorts] = useState([]);

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
    setFocusedCohort(center.cohorts[0]);
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
              <div className="h-2 w-2 rounded-full bg-snu-purple-300" />
              <div>
                <div className="text-xs font-normal">Place occupées</div>
                <div className="text-base font-bold">{placesTotal - placesLeft}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-200" />
              <div>
                <div className="text-xs font-normal">Place libres</div>
                <div className="text-base font-bold">{placesLeft}</div>
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
      <CenterInformations center={center} sessions={sessions} />
      <div className="flex justify-left border-bottom mb-2 pl-5">
        {(availableCohorts || []).map((cohort, index) => (
          <div
            key={index}
            className={`pb-2 px-4 flex align-items cursor-pointer  ${focusedCohort === cohort ? "text-snu-purple-300 border-b-2  border-snu-purple-300 " : null}`}
            onClick={() => {
              setFocusedCohort(cohort);
            }}>
            {cohort}
            {center.sessionStatus[index] === "DRAFT" ? <div className="border-[#CECECE] bg-[#F6F6F6] text-[#9A9A9A] border text-xs rounded-full p-1 ml-1">Brouillon</div> : null}
          </div>
        ))}
      </div>
      <div className="px-12 my-8">
        {environment !== "production" ? (
          center?._id && focusedSession?._id ? (
            <div className="flex gap-3">
              {/* // liste des volontaires */}
              <div className="flex flex-col justify-between items-start bg-white rounded-lg shadow-sm p-4 max-w-xl">
                <div>
                  <div className="text-lg font-medium mb-1 text-gray-900">Liste des volontaires</div>
                  <div className="text-sm font-normal text-gray-400 mb-3">Accès à la liste des volontaires affectés, au tableau de pointage...</div>
                </div>
                <button
                  className="px-4 py-2 rounded-md bg-snu-purple-300 text-sm text-white hover:shadow-lg"
                  onClick={() => history.push(`/centre/${center._id}/${focusedSession._id}/general`)}>
                  Voir les volontaires
                </button>
              </div>

              {/* // Taux doccupation */}
              <OccupationCard occupationPercentage={occupationPercentage} placesTotal={focusedSession.placesTotal} placesLeft={focusedSession.placesLeft} />

              {/* // équipe */}
              <div className="flex flex-col justify-between items-start bg-white rounded-lg shadow-sm p-4 max-w-xl">
                <div>
                  <div className="flex justify-between mb-1">
                    <div className="text-lg font-medium text-gray-900">L&apos;équipe</div>
                    <div className="flex flex-row -space-x-2">
                      {(focusedSession?.team || []).map((member, index) => {
                        const getInitials = (word) =>
                          (word || "")
                            .match(/\b(\w)/g)
                            .join("")
                            .substring(0, 2)
                            .toUpperCase();
                        if (index < 6)
                          return (
                            <div key={index} className={`h-8 w-8 flex justify-center items-center rounded-full bg-gray-100 text-indigo-600 text-xs border-2 border-white`}>
                              {getInitials(`${member.firstName} ${member.lastName}`)}
                            </div>
                          );
                      })}
                    </div>
                  </div>
                  <div className="text-sm font-normal text-gray-400 mb-3">Les coordonnées du chef de centre, du cadre spécialisé, de compagnie...</div>
                </div>
                <button
                  className="px-4 py-2 rounded-md border-[1px] border-snu-purple-300 text-sm text-snu-purple-300 hover:shadow-lg hover:text-white hover:bg-snu-purple-300"
                  // todo screen equipe
                  onClick={() => history.push(`/centre/${center._id}/${focusedSession._id}/equipe`)}>
                  Voir l&apos;équipe
                </button>
              </div>
            </div>
          ) : null
        ) : (
          <>
            <Nav tab={focusedTab} center={center} user={user} cohorts={availableCohorts} onChangeTab={setFocusedTab} focusedSession={focusedSession} />
            <Switch>
              {/* liste-attente reliquat ? */}
              <Route path="/centre/:id/liste-attente" component={() => <WaitingList center={center} updateCenter={updateCenter} focusedCohort={focusedCohort} />} />
              {[ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) ? (
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
                    <Team center={center} focusedSession={focusedSession} />
                  </>
                )}
              />
            </Switch>
          </>
        )}
      </div>
    </>
  );
}
