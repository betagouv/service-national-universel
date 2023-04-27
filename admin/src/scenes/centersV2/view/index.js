import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import queryString from "query-string";

import api from "../../../services/api";
import CenterInformations from "./CenterInformations";
import { toastr } from "react-redux-toastr";
import { capture } from "../../../sentry";
import { translate, ROLES, canCreateOrUpdateCohesionCenter } from "../../../utils";

import Trash from "../../../assets/icons/Trash.js";
import ExclamationCircle from "../../../assets/icons/ExclamationCircle";
import Pencil from "../../../assets/icons/Pencil";

import { COHESION_STAY_START, isSessionEditionOpen } from "snu-lib";

import Field from "../components/Field";
import Select from "../components/Select";

import Breadcrumbs from "../../../components/Breadcrumbs";
import ModalConfirmDelete from "../components/ModalConfirmDelete";
import TimeSchedule from "../components/TimeSchedule";
import Loader from "../../../components/Loader";

export default function Index({ ...props }) {
  const history = useHistory();
  const { user, sessionPhase1: sessionPhase1Redux } = useSelector((state) => state.Auth);

  const [center, setCenter] = useState();
  const [sessions, setSessions] = useState([]);
  const [focusedSession, setFocusedSession] = useState(null);

  const query = queryString.parse(location.search);
  const { cohorte: cohortQueryUrl } = query;

  // Bottom component
  const [editingBottom, setEditingBottom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editInfoSession, setEditInfoSession] = useState({});
  const [errors, setErrors] = useState({});
  const [modalDelete, setModalDelete] = useState({ isOpen: false });
  const [focusedCohortData, setFocusedCohortData] = useState(null);

  useEffect(() => {
    if (!focusedSession) return;
    (async () => {
      try {
        const { ok, data } = await api.get("/cohort/" + focusedSession.cohort);
        if (!ok) {
          return toastr.error("Oups, une erreur est survenue lors de la récupération de la cohorte", translate(data.code));
        }
        setFocusedCohortData(data);
      } catch (e) {
        capture(e);
      }
    })();
  }, [focusedSession]);

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
    if (!focusedSession) return;
    setEditInfoSession(focusedSession);
  }, [focusedSession]);

  useEffect(() => {
    const querySessionId = getQuerySessionId();
    if (querySessionId) {
      const session = sessions.find((s) => s._id === querySessionId);
      if (session) {
        setFocusedSession(session);
      }
    }
  }, [sessions]);

  const getCenter = (blockFocus = false) => {
    (async () => {
      if (!center || !center?.cohorts) return;
      const allSessions = await api.get(`/cohesion-center/${center._id}/session-phase1`);
      if (!allSessions.ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des sessions", translate(allSessions.code));
      }
      for (let i = 0; i < allSessions.data.length; i++) {
        const { schema } = await api.get(`/session-phase1/${allSessions.data[i]._id}/schema-repartition`);
        if (schema?.length === 0 && allSessions.data[i].placesTotal - allSessions.data[i].placesLeft === 0) {
          allSessions.data[i].canBeDeleted = true;
        } else {
          allSessions.data[i].canBeDeleted = false;
        }
      }
      if (allSessions.data.length === 0) setSessions([]);
      const focusedCohort = cohortQueryUrl || sessionPhase1Redux?.cohort || allSessions?.data[0]?.cohort;
      if ([ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role)) {
        allSessions.data.sort((a, b) => COHESION_STAY_START[a.cohort] - COHESION_STAY_START[b.cohort]);
        setSessions(allSessions.data);
        if (!blockFocus) setFocusedSession(allSessions.data.find((s) => s.cohort === focusedCohort) || allSessions?.data[0]);
      } else {
        const sessionFiltered = allSessions.data.filter((session) => session.headCenterId === user._id);
        sessionFiltered.sort((a, b) => COHESION_STAY_START[a.cohort] - COHESION_STAY_START[b.cohort]);
        const blockedSession = sessionFiltered.find((s) => s.cohort === focusedCohort);
        if (user.role === ROLES.HEAD_CENTER) {
          if (blockedSession) {
            setSessions([blockedSession]);
            setFocusedSession(blockedSession);
            return;
          }
        }
        setSessions(sessionFiltered);
        if (!blockFocus) setFocusedSession(blockedSession || allSessions?.data[0]);
      }
    })();
  };
  useEffect(() => {
    getCenter();
  }, [center]);

  function getQuerySessionId() {
    const { sessionId } = queryString.parse(location.search);
    if (sessionId) {
      return sessionId;
    } else {
      return null;
    }
  }

  const statusOptions = [
    { value: "VALIDATED", label: "Validée" },
    { value: "WAITING_VALIDATION", label: "En attente de validation" },
  ];

  const onSubmitBottom = async () => {
    setLoading(true);
    const errorsObject = {};
    if (isNaN(editInfoSession.placesTotal) || editInfoSession.placesTotal === "") {
      errorsObject.placesTotal = "Le nombre de places est incorrect";
    } else if (editInfoSession.placesTotal > center.placesTotal) {
      errorsObject.placesTotal = "Le nombre de places ne peut pas être supérieur à la capacité du centre";
    } else if (editInfoSession.placesTotal < focusedSession.placesTotal - focusedSession.placesLeft) {
      errorsObject.placesTotal = "Le nombre de places total est inférieur au nombre d'inscrits";
    }
    setErrors(errorsObject);
    if (Object.keys(errorsObject).length > 0) return setLoading(false);
    const { ok, code, data: returnedData } = await api.put(`/session-phase1/${focusedSession._id}`, editInfoSession);
    if (!ok) {
      toastr.error("Oups, une erreur est survenue lors de la modification du centre", code);
      return setLoading(false);
    }
    toastr.success("La session a bien été modifiée avec succès");
    setLoading(false);
    setErrors({});
    // faut aussi change le state sessions
    setFocusedSession(returnedData);
    getCenter(true);
    setEditingBottom(false);
  };
  const handleSessionDelete = async () => {
    try {
      setLoading(true);
      const { ok, code } = await api.remove(`/session-phase1/${focusedSession._id}`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la suppression de la session", code);
        return setLoading(false);
      }
      setLoading(false);
      setModalDelete({ isOpen: false });
      setCenter({ ...center, cohorts: center.cohorts.filter((c) => c !== focusedSession.cohort) });
      return toastr.success("La session a bien été supprimée");
    } catch (e) {
      capture(e);
      setLoading(false);
      setModalDelete({ isOpen: false });
      return toastr.error("Oups, une erreur est survenue lors de la suppression de la session");
    }
  };

  function onSessionChanged(newSession) {
    const index = sessions.findIndex((s) => s._id === newSession._id);
    if (index >= 0) {
      const newAllSessions = [...sessions];
      newAllSessions.splice(index, 1, newSession);
      setSessions(newAllSessions);
      setFocusedSession(newSession);
    }
  }

  if (!center) return <Loader />;
  return (
    <>
      {user.role !== ROLES.HEAD_CENTER && <Breadcrumbs items={[{ label: "Centres", to: "/centre" }, { label: "Fiche du centre" }]} />}
      <CenterInformations center={center} setCenter={setCenter} sessions={sessions} />
      {/* SESSION COMPONENT : */}
      {sessions.length > 0 ? (
        <div className="mx-8 mb-8 overflow-hidden rounded-lg bg-white pt-2">
          <div className="border-bottom flex items-center justify-between px-4">
            <div className="justify-left flex items-center">
              {(sessions || []).map((item, index) => (
                <div
                  key={index}
                  className={`mx-3 flex cursor-pointer items-center justify-center gap-2 py-3 px-2  ${
                    focusedSession?.cohort === item.cohort ? "border-b-2 border-blue-600  text-blue-600 " : null
                  }`}
                  onClick={() => {
                    setFocusedSession(item);
                  }}>
                  {sessions[index].status === "WAITING_VALIDATION" ? <ExclamationCircle className="h-5 w-5" fill="#2563eb" color="white" /> : null}
                  {item.cohort}
                </div>
              ))}
            </div>
            <div>
              {isSessionEditionOpen(user, focusedCohortData) ? (
                <>
                  {!editingBottom ? (
                    <button
                      className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setEditingBottom(true)}
                      disabled={loading}>
                      <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
                      Modifier
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs font-medium leading-5 text-gray-700 hover:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                          setEditingBottom(false);
                          setEditInfoSession(focusedSession);
                          setErrors({});
                        }}
                        disabled={loading}>
                        Annuler
                      </button>
                      <button
                        className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={onSubmitBottom}
                        disabled={loading}>
                        <Pencil stroke="#2563EB" className="mr-[6px] h-[12px] w-[12px]" />
                        Enregistrer les changements
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
          <div className="">
            {center?._id && focusedSession?._id && (
              <div className="">
                <div className="flex border-b-[1px] border-b-gray-200">
                  {/* // Taux doccupation */}
                  <OccupationCard
                    canBeDeleted={focusedSession.canBeDeleted}
                    placesTotal={focusedSession.placesTotal}
                    placesTotalModified={editInfoSession.placesTotal}
                    placesLeft={focusedSession.placesLeft}
                    user={user}
                    modalDelete={modalDelete}
                    setModalDelete={setModalDelete}
                    handleSessionDelete={handleSessionDelete}
                  />
                  {/* // liste des volontaires */}
                  <div className="flex max-w-xl flex-1 flex-col items-center justify-between gap-2 border-x-[1px] border-gray-200 bg-white">
                    <div className="flex w-full flex-1 items-center justify-center border-b-[1px] border-gray-200">
                      <button className="rounded-md px-4 py-2 text-sm hover:bg-gray-100" onClick={() => history.push(`/centre/${center._id}/${focusedSession._id}/general`)}>
                        Voir les volontaires
                      </button>
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                      <button className="rounded-md px-4 py-2 text-sm hover:bg-gray-100" onClick={() => history.push(`/centre/${center._id}/${focusedSession._id}/equipe`)}>
                        Voir l&apos;équipe
                      </button>
                    </div>
                  </div>

                  {/* // équipe */}
                  <div className="flex min-w-1/4 max-w-xl flex-1 flex-col items-center justify-between gap-4 bg-white p-4">
                    <div className="w-64">
                      <Select
                        readOnly={!editingBottom || ROLES.ADMIN !== user.role}
                        label="Statut"
                        icon={focusedSession.status === "WAITING_VALIDATION" ? <ExclamationCircle className="mr-2 h-5 w-5" fill="#2563eb" color="white" /> : null}
                        options={statusOptions}
                        setSelected={(e) => setEditInfoSession({ ...editInfoSession, status: e.value })}
                        selected={statusOptions.find((e) => e.value === editInfoSession.status)}
                      />
                    </div>
                    <div className="w-64">
                      <Field
                        error={errors.placesTotal}
                        readOnly={!editingBottom || !canCreateOrUpdateCohesionCenter(user)}
                        label="Places ouvertes"
                        value={editInfoSession.placesTotal}
                        onChange={(e) => setEditInfoSession({ ...editInfoSession, placesTotal: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <TimeSchedule session={focusedSession} className="p-8" onSessionChanged={onSessionChanged} />
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

const OccupationCard = ({ placesLeft, placesTotalModified, placesTotal, canBeDeleted, user, handleSessionDelete, modalDelete, setModalDelete }) => {
  let height = `h-0`;
  const getOccupationPercentage = () => {
    if (isNaN(placesTotalModified) || placesTotalModified === "" || placesTotalModified < 0) return 0.1;
    const percentage = (((placesTotal - placesLeft) * 100) / placesTotalModified).toFixed(2);
    if (percentage < 0 || percentage === Number.NEGATIVE_INFINITY) return 0.1;
    if (isNaN(percentage)) return 0.1;
    return percentage;
  };
  const [occupationPercentage, setOccupationPercentage] = useState(0);
  const placesLeftModified = !isNaN(placesLeft + parseInt(placesTotalModified) - placesTotal) ? placesLeft + parseInt(placesTotalModified) - placesTotal : 0;
  useEffect(() => {
    setOccupationPercentage(getOccupationPercentage());
  }, [placesTotalModified]);

  if (occupationPercentage < 20) height = "h-[20%]";
  else if (occupationPercentage < 30) height = "h-[30%]";
  else if (occupationPercentage < 40) height = "h-[40%]";
  else if (occupationPercentage < 50) height = "h-[50%]";
  else if (occupationPercentage < 60) height = "h-[60%]";
  else if (occupationPercentage < 70) height = "h-[70%]";
  else if (occupationPercentage < 80) height = "h-[80%]";
  else if (occupationPercentage < 100) height = "h-[90%]";
  else if (occupationPercentage >= 100) height = "h-[100%]";

  let bgColor = "bg-blue-800";
  if (occupationPercentage > 100) bgColor = "bg-red-500";
  if (isNaN(occupationPercentage)) return <></>;
  return occupationPercentage ? (
    <div className="flex flex-1 flex-col items-center justify-center py-4 px-8">
      <ModalConfirmDelete
        isOpen={modalDelete.isOpen}
        title={modalDelete.title}
        message={modalDelete.message}
        onCancel={() => setModalDelete({ ...modalDelete, isOpen: false })}
        onDelete={modalDelete.onDelete}
      />
      <div className="flex items-center justify-center gap-4">
        {/* barre */}
        {Math.floor(occupationPercentage) === 0 ? (
          <div className="flex h-28 w-9 flex-col items-center justify-center overflow-hidden rounded-lg bg-gray-200 text-xs font-bold">0%</div>
        ) : (
          <div className="flex h-28 w-9 flex-col justify-end overflow-hidden rounded-lg bg-gray-200">
            <div className={`flex w-9 items-center justify-center ${height} ${bgColor} rounded-lg text-xs font-bold text-white`}>{Math.floor(occupationPercentage)}%</div>
          </div>
        )}

        {/* nombres */}
        <div className="flex flex-col justify-around">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-6 w-2 rounded-full bg-blue-800" />
            <div>
              <div className="text-xs font-normal">Places occupées</div>
              <div className="text-base font-bold">{placesTotal - placesLeft}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-2 rounded-full bg-gray-200" />
            <div>
              <div className="text-xs font-normal">Places libres</div>
              <div className="text-base font-bold">{placesLeftModified}</div>
            </div>
          </div>
        </div>
      </div>
      {canCreateOrUpdateCohesionCenter(user) && (
        <div
          onClick={() => {
            canBeDeleted &&
              setModalDelete({
                isOpen: true,
                title: "Supprimer la session",
                message: "Êtes-vous sûr de vouloir supprimer cette session?",
                onDelete: handleSessionDelete,
              });
          }}
          className={`mt-3 flex w-full flex-row items-center justify-end gap-2 ${canBeDeleted ? "cursor-pointer" : "cursor-default"}`}>
          <Trash className={`${canBeDeleted ? "text-red-400" : "text-gray-400"}`} width={14} height={14} />
          <div className={`${canBeDeleted ? "text-gray-800" : "text-gray-500"} text-xs`}>Supprimer le séjour</div>
        </div>
      )}
    </div>
  ) : null;
};
