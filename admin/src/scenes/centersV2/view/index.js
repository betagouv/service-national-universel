import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import queryString from "query-string";

import api from "../../../services/api";
import CenterInformations from "./CenterInformations";
import { toastr } from "react-redux-toastr";
import { translate, ROLES, canCreateOrUpdateCohesionCenter } from "../../../utils";
import Plus from "../../../assets/icons/Plus.js";
import Trash from "../../../assets/icons/Trash.js";
import ExclamationCircle from "../../../assets/icons/ExclamationCircle";
import Pencil from "../../../assets/icons/Pencil";

import Field from "../components/Field";
import Select from "../components/Select";

import Breadcrumbs from "../../../components/Breadcrumbs";

export default function Index({ ...props }) {
  const history = useHistory();
  const { user, sessionPhase1: sessionPhase1Redux } = useSelector((state) => state.Auth);

  const [center, setCenter] = useState();
  const [sessions, setSessions] = useState([]);
  const [focusedCohort, setFocusedCohort] = useState();
  const [focusedSession, setFocusedSession] = useState();

  const [availableCohorts, setAvailableCohorts] = useState([]);
  const query = queryString.parse(location.search);
  const { cohorte: cohortQueryUrl } = query;

  // Bottom component
  const [editingBottom, setEditingBottom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editInfoSession, setEditInfoSession] = useState({});
  const [errors, setErrors] = useState({});

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
    setEditInfoSession(focusedSession);
  }, [focusedSession]);

  useEffect(() => {
    (async () => {
      if (!center || !center?.cohorts || !center?.cohorts?.length) return;
      const allSessions = await api.get(`/cohesion-center/${center._id}/session-phase1`);
      if (!allSessions.ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des sessions", translate(allSessions.code));
      }
      if ([ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role)) {
        setAvailableCohorts(allSessions.data);
      } else {
        setAvailableCohorts(allSessions.data.filter((session) => session.headCenterId === user._id));
      }
    })();
  }, [center]);

  const statusOptions = [
    { value: "VALIDATED", label: "Validée" },
    { value: "WAITING_VALIDATION", label: "En attente de validation" },
  ];

  const onSubmitBottom = () => {
    const errorsObject = {};
    if (isNaN(editInfoSession.placesTotal) || editInfoSession.placesTotal === "") {
      errorsObject.placesTotal = "Le nombre de places est incorrect";
    } else if (editInfoSession.placesTotal > center.placesTotal) {
      errorsObject.placesTotal = "Le nomre de places ne peut pas être supérieur à la capacité du centre";
    } else if (editInfoSession.placesTotal < focusedSession.placesLeft) {
      errorsObject.placesTotal = "Le nombre de places total est inférieur au nombre d'inscrits";
    }
    return setErrors(errorsObject);
  };

  if (!center) return <div />;
  return (
    <>
      <Breadcrumbs items={[{ label: "Centres", to: "/centre" }, { label: "Fiche du centre" }]} />
      <CenterInformations center={center} setCenter={setCenter} sessions={sessions} />
      {/* SESSION COMPONENT : */}
      <div className="bg-white rounded-lg mx-8 mb-8 overflow-hidden pt-2">
        <div className="flex justify-between items-center border-bottom px-4">
          <div className="flex justify-left items-center">
            {(availableCohorts || []).map((item, index) => (
              <div
                key={index}
                className={`py-3 px-2 mx-3 flex items-center cursor-pointer  ${focusedCohort === item.cohort ? "text-blue-600 border-b-2  border-blue-600 " : null}`}
                onClick={() => {
                  setFocusedCohort(item.cohort);
                }}>
                {availableCohorts[index].status === "WAITING_VALIDATION" ? <ExclamationCircle className="w-5 h-5" fill="#2563eb" color="white" /> : null}
                {item.cohort}
              </div>
            ))}
          </div>
          <div>
            {canCreateOrUpdateCohesionCenter(user) ? (
              <>
                {!editingBottom ? (
                  <button
                    className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setEditingBottom(true)}
                    disabled={loading}>
                    <Pencil stroke="#2563EB" className="w-[12px] h-[12px]" />
                    Modifier
                  </button>
                ) : (
                  <div className="flex itmes-center gap-2">
                    <button
                      className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-gray-100 text-gray-700 bg-gray-100 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        setEditingBottom(false);
                        setEditInfoSession(focusedSession);
                      }}
                      disabled={loading}>
                      Annuler
                    </button>
                    <button
                      className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={onSubmitBottom}
                      disabled={loading}>
                      <Pencil stroke="#2563EB" className="w-[12px] h-[12px] mr-[6px]" />
                      Enregistrer les changements
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
        <div className="">
          {center?._id && focusedSession?._id ? (
            <div className="flex">
              {/* // Taux doccupation */}
              <OccupationCard placesTotal={focusedSession.placesTotal} placesTotalModified={editInfoSession.placesTotal} placesLeft={focusedSession.placesLeft} />
              {/* // liste des volontaires */}
              <div className="flex flex-1 flex-col justify-between items-center bg-white max-w-xl gap-2 border-x-[1px] border-gray-200">
                <div className="flex flex-1 items-center justify-center border-b-[1px] border-gray-200 w-full">
                  <button className="px-4 py-2 rounded-md text-sm hover:bg-gray-100" onClick={() => history.push(`/centre/${center._id}/${focusedSession._id}/general`)}>
                    Voir les volontaires
                  </button>
                </div>
                <div className="flex flex-1 items-center justify-center">
                  <button className="px-4 py-2 rounded-md text-sm hover:bg-gray-100" onClick={() => history.push(`/centre/${center._id}/${focusedSession._id}/general`)}>
                    Voir l&apos;équipe
                  </button>
                </div>
              </div>

              {/* // équipe */}
              <div className="flex gap-4 flex-1 min-w-1/4 flex-col justify-between items-center bg-white p-4 max-w-xl">
                <div className="w-64">
                  <Select
                    readOnly={!editingBottom || ROLES.ADMIN != user.role}
                    label="Statut"
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
          ) : null}
        </div>
      </div>
    </>
  );
}

const OccupationCard = ({ placesLeft, placesTotalModified, placesTotal }) => {
  let height = `h-0`;
  const canDelete = false;

  const getOccupationPercentage = () => {
    if (isNaN(placesTotalModified) || placesTotalModified === "" || placesTotalModified < 0) return 0.1;
    const percentage = (((placesTotal - placesLeft) * 100) / placesTotalModified).toFixed(2);
    if (percentage < 0 || percentage === Number.NEGATIVE_INFINITY) return 0.1;
    return percentage;
  };
  const occupationPercentage = getOccupationPercentage();
  const placesLeftModified = !isNaN(placesLeft + parseInt(placesTotalModified) - placesTotal) ? placesLeft + parseInt(placesTotalModified) - placesTotal : 0;

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

  useEffect(() => {
    console.log("OCCUPATION IS :", occupationPercentage);
  }, [occupationPercentage]);

  return occupationPercentage ? (
    <div className="py-4 px-8 flex flex-1 flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-4">
        {/* barre */}
        {Math.floor(occupationPercentage) === 0 ? (
          <div className="flex flex-col justify-center items-center font-bold text-xs w-9 h-28 bg-gray-200 rounded-lg overflow-hidden">0%</div>
        ) : (
          <div className="flex flex-col justify-end w-9 h-28 bg-gray-200 rounded-lg overflow-hidden">
            <div className={`flex justify-center items-center w-9 ${height} ${bgColor} rounded-lg text-white font-bold text-xs`}>{Math.floor(occupationPercentage)}%</div>
          </div>
        )}

        {/* nombres */}
        <div className="flex flex-col justify-around">
          <div className="flex items-center gap-2 mb-2">
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
      <div className={`w-full flex flex-row gap-2 mt-3 justify-end items-center ${canDelete ? "cursor-pointer" : "cursor-default"}`}>
        <Trash className={`${canDelete ? "text-red-400" : "text-gray-400"}`} width={14} height={14} />
        <div className={`${canDelete ? "text-gray-800" : "text-gray-500"} text-xs`}>Supprimer le séjour</div>
      </div>
    </div>
  ) : null;
};
