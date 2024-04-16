import React, { useEffect, useState } from "react";
import queryString from "query-string";

import { canPutSpecificDateOnSessionPhase1, isSessionEditionOpen } from "snu-lib";

import { canCreateOrUpdateCohesionCenter, translate } from "@/utils";
import api from "@/services/api";
import dayjs from "@/utils/dayjs.utils";
import Pencil from "@/assets/icons/Pencil";
import ToggleDate from "@/components/ui/forms/dateForm/ToggleDate";

import Field from "../Field";
import TimeSchedule from "../TimeSchedule";
import PedagoProject from "../PedagoProject";
import { capture } from "@/sentry";
import { toastr } from "react-redux-toastr";
import OccupationCard from "./OccupationCard";

function getQuerySessionId() {
  const { sessionId } = queryString.parse(location.search);
  if (sessionId) {
    return sessionId;
  } else {
    return null;
  }
}

export default function SessionList({ center, sessions, user, focusedSession, onFocusedSessionChange, onSessionsChange, onRefreshCenter, onCenterChange }) {
  const [editingBottom, setEditingBottom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editInfoSession, setEditInfoSession] = useState({});
  const [errors, setErrors] = useState({});
  const [modalDelete, setModalDelete] = useState({ isOpen: false });

  const [focusedCohortData, setFocusedCohortData] = useState(null);

  useEffect(() => {
    const querySessionId = getQuerySessionId();
    if (querySessionId) {
      const session = sessions.find((s) => s._id === querySessionId);
      if (session) {
        onFocusedSessionChange(session);
      }
    }
  }, [sessions]);

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
    if (!focusedSession) return;
    setEditInfoSession(focusedSession);
  }, [focusedSession]);

  function handleSessionChange(newSession) {
    const index = sessions.findIndex((s) => s._id === newSession._id);
    if (index >= 0) {
      const newAllSessions = [...sessions];
      newAllSessions.splice(index, 1, newSession);
      onSessionsChange(newAllSessions);
      onFocusedSessionChange(newSession);
    }
  }

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

    if (editInfoSession.hasSpecificDate) {
      if (!editInfoSession.dateStart || !editInfoSession.dateEnd) {
        errorsObject.date = "La date de début et de fin sont obligatoires";
      } else if (editInfoSession.dateStart > editInfoSession.dateEnd) {
        errorsObject.date = "La date de début doit être antérieure à la date de fin";
      }
    } else {
      editInfoSession.dateStart = null;
      editInfoSession.dateEnd = null;
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
    onFocusedSessionChange({ ...returnedData, hasSpecificDate: returnedData?.dateStart && returnedData?.dateEnd ? true : false });
    onRefreshCenter();
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
      onCenterChange({ ...center, cohorts: center.cohorts.filter((c) => c !== focusedSession.cohort) });
      return toastr.success("La session a bien été supprimée");
    } catch (e) {
      capture(e);
      setLoading(false);
      setModalDelete({ isOpen: false });
      return toastr.error("Oups, une erreur est survenue lors de la suppression de la session");
    }
  };

  console.log(sessions);

  if (!sessions || sessions.length === 0) return null;
  return (
    <div className="mx-8 mb-8 rounded-lg bg-white pt-2 z-0">
      <div className="border-bottom flex items-center justify-between px-4">
        <div className="justify-left flex items-center">
          {sessions?.map((item, index) => (
            <div
              key={index}
              className={`mx-3 flex cursor-pointer items-center justify-center gap-2 py-3 px-2  ${
                focusedSession?.cohort === item.cohort ? "border-b-2 border-blue-600  text-blue-600 " : null
              }`}
              onClick={() => {
                onFocusedSessionChange(item);
              }}>
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
                <div className="flex w-full flex-1 items-center justify-center">
                  <button className="rounded-md px-4 py-2 text-sm hover:bg-gray-100" onClick={() => history.push(`/centre/${center._id}/${focusedSession._id}/general`)}>
                    Voir les volontaires
                  </button>
                </div>
                <div className="w-full border-b-[1px] border-gray-200" />
                <div className="flex flex-1 items-center justify-center">
                  <button className="rounded-md px-4 py-2 text-sm hover:bg-gray-100" onClick={() => history.push(`/centre/${center._id}/${focusedSession._id}/equipe`)}>
                    Voir l&apos;équipe
                  </button>
                </div>
              </div>

              {/* // info */}
              <div className="flex max-w-xl flex-1 flex-col items-center justify-around bg-white">
                <div className="flex w-80 flex-1 items-center justify-center ">
                  <Field
                    error={errors.placesTotal}
                    readOnly={!editingBottom || !canCreateOrUpdateCohesionCenter(user)}
                    label="Places ouvertes"
                    value={editInfoSession.placesTotal}
                    onChange={(e) => setEditInfoSession({ ...editInfoSession, placesTotal: e.target.value })}
                    tooltips={
                      "C’est le nombre de places proposées sur un séjour. Cette donnée doit être inférieure ou égale à la capacité maximale d’accueil, elle ne peut lui être supérieure."
                    }
                  />
                </div>
                <div className="w-full border-b-[1px] h-[1px] border-gray-200" />
                <div className="flex flex-1 items-center justify-center w-80">
                  <div className="flex flex-col w-full">
                    <ToggleDate
                      label="Dates spécifiques"
                      tooltipText={
                        focusedCohortData ? (
                          <p>
                            Les dates de cette session diffèrent des dates officielles :{" "}
                            <strong>{`${dayjs(focusedCohortData.dateStart).format("DD")} - ${dayjs(focusedCohortData.dateEnd).format("DD MMMM YYYY")}`}</strong>.
                          </p>
                        ) : null
                      }
                      readOnly={!editingBottom || !canPutSpecificDateOnSessionPhase1(user)}
                      value={editInfoSession.hasSpecificDate}
                      onChange={() => setEditInfoSession({ ...editInfoSession, hasSpecificDate: !editInfoSession.hasSpecificDate })}
                      range={{
                        from: editInfoSession?.dateStart || undefined,
                        to: editInfoSession?.dateEnd || undefined,
                      }}
                      onChangeRange={(range) => {
                        setEditInfoSession({
                          ...editInfoSession,
                          hasSpecificDate: range?.from !== undefined || range?.to !== undefined,
                          dateStart: range?.from,
                          dateEnd: range?.to,
                        });
                      }}
                    />
                    {errors?.date && <div className="text-[#EF4444] mx-auto mt-1">{errors?.date}</div>}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex mx-4 mt-4 gap-2 pb-4 justify-center">
              <PedagoProject session={focusedSession} className="p-1" onSessionChanged={handleSessionChange} />
              <TimeSchedule session={focusedSession} className="p-1" onSessionChanged={handleSessionChange} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
