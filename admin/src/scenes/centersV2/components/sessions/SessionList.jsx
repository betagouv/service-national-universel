import React, { useState } from "react";
import { useSelector } from "react-redux";

import { canPutSpecificDateOnSessionPhase1, isSessionEditionOpen, canEditSanitaryEmailContact, patternEmailAcademy } from "snu-lib";

import { capture } from "@/sentry";
import { canCreateOrUpdateCohesionCenter } from "@/utils";
import api from "@/services/api";
import dayjs from "@/utils/dayjs.utils";
import Pencil from "@/assets/icons/Pencil";

import ToggleDate from "@/components/ui/forms/dateForm/ToggleDate";
import SelectCohort from "@/components/cohorts/SelectCohort";

import { Title } from "../commons";
import Field from "../Field";
import TimeSchedule from "../TimeSchedule";
import PedagoProject from "../PedagoProject";
import { toastr } from "react-redux-toastr";
import OccupationCard from "./OccupationCard";
import { useHistory } from "react-router-dom";

export default function SessionList({ center, setCenter, sessions, setSessions, user }) {
  const history = useHistory();
  const cohorts = useSelector((state) => state.Cohorts);
  let params = new URLSearchParams(location.search);

  const [selectedCohort, setSelectedCohort] = useState(params.get("cohorte") || sessions[0]?.cohort || "wesh");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [modalDelete, setModalDelete] = useState({ isOpen: false });

  const session = sessions.find((session) => session.cohort === selectedCohort);
  const cohort = cohorts.find((cohort) => cohort.name === selectedCohort);

  const onSubmitBottom = async () => {
    setLoading(true);
    const errorsObject = {};
    if (isNaN(formValues.placesTotal) || formValues.placesTotal === "") {
      errorsObject.placesTotal = "Le nombre de places est incorrect";
    } else if (formValues.placesTotal > center.placesTotal) {
      errorsObject.placesTotal = "Le nombre de places ne peut pas être supérieur à la capacité du centre";
    } else if (formValues.placesTotal < session.placesTotal - session.placesLeft) {
      errorsObject.placesTotal = "Le nombre de places total est inférieur au nombre d'inscrits";
    }

    if (formValues.hasSpecificDate) {
      if (!formValues.dateStart || !formValues.dateEnd) {
        errorsObject.date = "La date de début et de fin sont obligatoires";
      } else if (formValues.dateStart > formValues.dateEnd) {
        errorsObject.date = "La date de début doit être antérieure à la date de fin";
      }
    } else {
      formValues.dateStart = null;
      formValues.dateEnd = null;
    }
    if (formValues.sanitaryContactEmail) {
      const regex = new RegExp(patternEmailAcademy);
      if (!regex.test(formValues.sanitaryContactEmail)) {
        errorsObject.sanitaryContactEmail = "L’adresse email ne semble pas valide. Veuillez vérifier qu’il s’agit bien d’une adresse académique.";
      }
    }

    setErrors(errorsObject);
    if (Object.keys(errorsObject).length > 0) return setLoading(false);
    const { ok, code, data } = await api.put(`/session-phase1/${session._id}`, formValues);
    if (!ok) {
      toastr.error("Oups, une erreur est survenue lors de la modification du centre", code);
      return setLoading(false);
    }
    toastr.success("La session a bien été modifiée avec succès");
    setLoading(false);
    setEditing(false);
    setErrors({});
    setSessions(sessions.map((session) => (session._id === data._id ? data : session)));
  };

  const handleSessionDelete = async () => {
    try {
      setLoading(true);
      const { ok, code } = await api.remove(`/session-phase1/${session._id}`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la suppression de la session", code);
        return setLoading(false);
      }
      setLoading(false);
      setModalDelete({ isOpen: false });
      setCenter({ ...center, cohorts: center.cohorts.filter((c) => c !== session.cohort) });
      return toastr.success("La session a bien été supprimée");
    } catch (e) {
      capture(e);
      setLoading(false);
      setModalDelete({ isOpen: false });
      return toastr.error("Oups, une erreur est survenue lors de la suppression de la session");
    }
  };

  if (!sessions || sessions.length === 0) return null;
  return (
    <div className="flex flex-col gap-4 mx-8">
      <div className="flex items-center justify-between">
        <Title>Par séjour</Title>
        <div className="flex items-center">
          <SelectCohort
            cohort={cohort.name}
            withBadge
            filterFn={(c) => sessions.find((s) => s.cohort === c.name)}
            onChange={(cohortName) => {
              setEditing(false);
              setSelectedCohort(cohortName);
              history.replace({ search: `?cohort=${cohortName}` });
            }}
          />
        </div>
      </div>
      <div className="flex flex-col px-8 py-4 gap-4 mb-8 rounded-lg bg-white z-0">
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium leading-6 text-gray-900">Détails</div>
          {isSessionEditionOpen(user, cohort) && (
            <>
              {!editing ? (
                <button
                  className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setEditing(true)}
                  disabled={loading}>
                  <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
                  Modifier
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs font-medium leading-5 text-gray-700 hover:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => {
                      setEditing(false);
                      setFormValues(session);
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
          )}
        </div>
        <div className="border-top">
          {center?._id && session?._id && (
            <div className="">
              <div className="flex border-b-[1px] border-b-gray-200">
                {/* // Taux doccupation */}
                <OccupationCard
                  canBeDeleted={session.canBeDeleted}
                  placesTotal={session.placesTotal}
                  placesLeft={session.placesLeft}
                  user={user}
                  modalDelete={modalDelete}
                  setModalDelete={setModalDelete}
                  handleSessionDelete={handleSessionDelete}
                />
                {/* // liste des volontaires */}
                <div className="flex max-w-xl flex-1 flex-col items-center justify-between gap-2 border-x-[1px] border-gray-200 bg-white">
                  <div className="flex w-full flex-1 items-center justify-center">
                    <button className="rounded-md px-4 py-2 text-sm hover:bg-gray-100" onClick={() => history.push(`/centre/${center._id}/${session._id}/general`)}>
                      Voir les volontaires
                    </button>
                  </div>
                  <div className="w-full border-b-[1px] border-gray-200" />
                  <div className="flex flex-1 items-center justify-center">
                    <button className="rounded-md px-4 py-2 text-sm hover:bg-gray-100" onClick={() => history.push(`/centre/${center._id}/${session._id}/equipe`)}>
                      Voir l&apos;équipe
                    </button>
                  </div>
                </div>

                {/* // info */}
                <div className="flex max-w-xl flex-1 flex-col items-center justify-around bg-white">
                  <div className="flex w-80 flex-1 items-center justify-center ">
                    <Field
                      error={errors.placesTotal}
                      readOnly={!editing || !canCreateOrUpdateCohesionCenter(user)}
                      label="Places ouvertes"
                      value={editing ? formValues.placesTotal : session.placesTotal}
                      onChange={(e) => setFormValues({ ...formValues, placesTotal: e.target.value })}
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
                          <p>
                            Les dates de cette session diffèrent des dates officielles :{" "}
                            <strong>{`${dayjs(cohort?.dateStart).format("DD")} - ${dayjs(cohort?.dateEnd).format("DD MMMM YYYY")}`}</strong>.
                          </p>
                        }
                        readOnly={!editing || !canPutSpecificDateOnSessionPhase1(user)}
                        value={editing ? formValues.hasSpecificDate : session.hasSpecificDate}
                        onChange={() => setFormValues({ ...formValues, hasSpecificDate: !formValues.hasSpecificDate })}
                        range={
                          editing
                            ? { from: formValues.dateStart, to: formValues.dateEnd }
                            : { from: session.dateStart || cohort?.dateStart, to: session.dateEnd || cohort?.dateEnd }
                        }
                        onChangeRange={(range) => {
                          setFormValues({
                            ...formValues,
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
              {center?._id && session?._id && center.region === "Provence-Alpes-Côte d'Azur" && cohort === "Juin 2024 - 2" && (
                <div className="flex flex-row justify-center items-center w-full mt-2">
                  <div className="w-1/2">
                    <label>Réception des fiches sanitaires (facultatif)</label>
                    <Field
                      error={errors.sanitaryContactEmail}
                      readOnly={!editing || !canEditSanitaryEmailContact(user, cohort)}
                      disabled={!canEditSanitaryEmailContact(user, cohort)}
                      label="Adresse email académique"
                      value={editing ? formValues.sanitaryContactEmail : session?.sanitaryContactEmail}
                      onChange={(e) => setFormValues({ ...formValues, sanitaryContactEmail: e.target.value })}
                      tooltips={
                        "Si vous renseignez l'adresse email suivante, elle sera visible sur l'espace personnel des volontaires. Ils seront ainsi invités à envoyer leurs fiches sanitaires à cette adresse. Seules les adresses emails académiques sécurisées sont autorisées."
                      }
                    />
                  </div>
                </div>
              )}
              <div className="flex mx-4 mt-4 gap-2 pb-4 justify-center">
                <PedagoProject session={session} className="p-1" onSessionChanged={(c) => params.set(c)} />
                <TimeSchedule session={session} className="p-1" onSessionChanged={(c) => params.set(c)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
