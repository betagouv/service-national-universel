import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import { canPutSpecificDateOnSessionPhase1, isSessionEditionOpen, canEditSanitaryEmailContact, patternEmailAcademy, validateEmailAcademique } from "snu-lib";

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
import { CohortState } from "@/redux/cohorts/reducer";
import { AuthState } from "@/redux/auth/reducer";
import { Center, Session } from "@/types";

type Props = {
  center: Center;
  setCenter: React.Dispatch<React.SetStateAction<Center>>;
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
};

type Errors = {
  [Key: string]: string;
};

export default function SessionList({ center, setCenter, sessions, setSessions }: Props) {
  const history = useHistory();
  const cohorts = useSelector((state: CohortState) => state.Cohorts);
  const user = useSelector((state: AuthState) => state.Auth.user);
  const selectedCohort = new URLSearchParams(location.search).get("cohorte") || sessions[0]?.cohort;
  const cohort = cohorts.find((cohort) => cohort.name === selectedCohort) || cohorts[0];
  const session = sessions.find((session) => session.cohort === selectedCohort) || sessions[0];
  const setSession = (newSession: Session) => setSessions(sessions.map((session) => (session._id === newSession._id ? newSession : session)));

  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<Session | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [modalDelete, setModalDelete] = useState({ isOpen: false });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values) return;

    const errorsObject: Errors = {};
    if (isNaN(values.placesTotal)) {
      errorsObject.placesTotal = "Le nombre de places est incorrect";
    } else if (values.placesTotal > center.placesTotal) {
      errorsObject.placesTotal = "Le nombre de places ne peut pas être supérieur à la capacité du centre";
    } else if (values.placesTotal < session.placesTotal - session.placesLeft) {
      errorsObject.placesTotal = "Le nombre de places total est inférieur au nombre d'inscrits";
    }
    if (values.dateStart && values.dateEnd && values.dateStart > values.dateEnd) {
      errorsObject.date = "La date de début doit être antérieure à la date de fin";
    }
    if (values.sanitaryContactEmail) {
      const regex = new RegExp(patternEmailAcademy);
      if (!regex.test(values.sanitaryContactEmail)) {
        errorsObject.sanitaryContactEmail = "L’adresse email ne semble pas valide. Veuillez vérifier qu’il s’agit bien d’une adresse académique.";
      } else if (!validateEmailAcademique(values.sanitaryContactEmail)) {
        errorsObject.sanitaryContactEmail =
          "Cette adresse email académique n'existe pas ou n'est pas référencée. Veuillez vérifier qu’il s’agit bien d’une adresse académique valide.";
      }
    }
    if (Object.keys(errorsObject).length > 0) {
      setErrors(errorsObject);
      return;
    }

    setLoading(true);
    try {
      const { ok, code, data } = await api.put(`/session-phase1/${session._id}`, values);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la modification du centre", code);
        setLoading(false);
        return;
      }
      toastr.success("La session a bien été modifiée avec succès", "");
      setSession(data);
      setValues(null);
      setErrors({});
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modification du centre", "");
    } finally {
      setLoading(false);
    }
  };

  const handleSessionDelete = async () => {
    try {
      setLoading(true);
      const { ok, code } = await api.remove(`/session-phase1/${session._id}`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la suppression de la session", code);
        setLoading(false);
        return;
      }
      setLoading(false);
      setModalDelete({ isOpen: false });
      setCenter({ ...center, cohorts: center.cohorts.filter((cohort) => cohort !== session.cohort) });
      setSessions(sessions.filter((s) => s._id !== session._id));
      history.push({ search: `?cohorte=${center.cohorts[0]}` });
      toastr.success("La session a bien été supprimée", "");
    } catch (e) {
      capture(e);
      setLoading(false);
      setModalDelete({ isOpen: false });
      toastr.error("Oups, une erreur est survenue lors de la suppression de la session", "");
    }
  };

  const handleToggleDate = () => {
    if (!values) return;
    if (values.dateStart && values.dateEnd) {
      setValues({ ...values, dateStart: null, dateEnd: null });
    } else {
      setValues({
        ...values,
        dateStart: session?.dateStart || cohort?.dateStart || new Date().toDateString(),
        dateEnd: session?.dateEnd || cohort?.dateEnd || new Date().toDateString(),
      });
    }
  };

  const handleSelect = (cohortName: string) => {
    history.push(`?cohorte=${cohortName}`);
  };

  return (
    <div className="flex flex-col gap-4 mx-8">
      <div className="flex items-center justify-between">
        <Title>Par séjour</Title>
        <div className="flex items-center">
          <SelectCohort cohort={selectedCohort} withBadge filterFn={(c) => Boolean(sessions.find((s) => s.cohort === c.name))} onChange={handleSelect} />
        </div>
      </div>
      <div className="flex flex-col px-8 py-4 gap-4 mb-8 rounded-lg bg-white z-0">
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium leading-6 text-gray-900">Détails</div>
          {isSessionEditionOpen(user, cohort) && (
            <>
              {!values ? (
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setValues(session)}
                  disabled={loading}>
                  <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
                  Modifier
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs font-medium leading-5 text-gray-700 hover:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => {
                      setValues(null);
                      setErrors({});
                    }}
                    disabled={loading}>
                    Annuler
                  </button>
                  <button
                    className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    type="submit"
                    form="session-form"
                    disabled={!values || loading}>
                    <Pencil stroke="#2563EB" className="mr-[6px] h-[12px] w-[12px]" />
                    Enregistrer les changements
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <>
          <div className="border-top">
            <form onSubmit={handleSubmit} id="session-form">
              <div className="flex border-b-[1px] border-b-gray-200">
                {/* // Taux doccupation */}
                <OccupationCard session={session} user={user} modalDelete={modalDelete} setModalDelete={setModalDelete} handleSessionDelete={handleSessionDelete} />
                {/* // liste des volontaires */}
                <div className="flex max-w-xl flex-1 flex-col items-center justify-between gap-2 border-x-[1px] border-gray-200 bg-white">
                  <div className="flex w-full flex-1 items-center justify-center">
                    <Link className="rounded-md px-4 py-2 text-sm hover:bg-gray-100" to={`/centre/${center._id}/${session._id}/general`}>
                      Voir les volontaires
                    </Link>
                  </div>
                  <div className="w-full border-b-[1px] border-gray-200" />
                  <div className="flex flex-1 items-center justify-center">
                    <Link className="rounded-md px-4 py-2 text-sm hover:bg-gray-100" to={`/centre/${center._id}/${session._id}/equipe`}>
                      Voir l&apos;équipe
                    </Link>
                  </div>
                </div>

                {/* // info */}
                <div className="flex max-w-xl flex-1 flex-col items-center justify-around bg-white">
                  <div className="flex w-80 flex-1 items-center justify-center ">
                    <Field
                      error={errors.placesTotal}
                      readOnly={!values || !canCreateOrUpdateCohesionCenter(user)}
                      label="Places ouvertes"
                      value={values?.placesTotal?.toString() || session.placesTotal.toString()}
                      onChange={(e) => {
                        if (values) setValues({ ...values, placesTotal: parseInt(e.target.value) });
                      }}
                      tooltips="C’est le nombre de places proposées sur un séjour. Cette donnée doit être inférieure ou égale à la capacité maximale d’accueil, elle ne peut lui être supérieure."
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
                        readOnly={!values || !canPutSpecificDateOnSessionPhase1(user)}
                        value={values ? !!values?.dateStart : !!session.dateStart}
                        onChange={handleToggleDate}
                        range={{
                          from: values?.dateStart || session.dateStart,
                          to: values?.dateEnd || session.dateEnd,
                        }}
                        onChangeRange={(range: { to: string; from: string }) => {
                          if (values) setValues({ ...values, dateStart: range?.from, dateEnd: range?.to });
                        }}
                      />
                      {errors?.date && <div className="text-[#EF4444] mx-auto mt-1">{errors?.date}</div>}
                    </div>
                  </div>
                </div>
              </div>
              {center?.region === "Provence-Alpes-Côte d'Azur" && cohort?.name === "Juin 2024 - 2" && (
                <div className="flex flex-row justify-center items-center w-full mt-2">
                  <div className="w-1/2">
                    <label>Réception des fiches sanitaires (facultatif)</label>
                    <Field
                      error={errors.sanitaryContactEmail}
                      readOnly={!values || !canEditSanitaryEmailContact(user, cohort)}
                      disabled={!canEditSanitaryEmailContact(user, cohort)}
                      label="Adresse email académique"
                      value={values?.sanitaryContactEmail || session?.sanitaryContactEmail}
                      onChange={(e) => {
                        if (values) setValues({ ...values, sanitaryContactEmail: e.target.value });
                      }}
                      tooltips="Si vous renseignez l'adresse email suivante, elle sera visible sur l'espace personnel des volontaires. Ils seront ainsi invités à envoyer leurs fiches sanitaires à cette adresse. Seules les adresses emails académiques sécurisées sont autorisées."
                    />
                  </div>
                </div>
              )}
            </form>
            <div className="flex mx-4 mt-4 gap-2 pb-4 justify-center">
              <PedagoProject session={session} className="p-1" setSession={setSession} />
              <TimeSchedule session={session} className="p-1" setSession={setSession} />
            </div>
          </div>
        </>
      </div>
    </div>
  );
}