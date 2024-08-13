import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import cx from "classnames";
import ReactTooltip from "react-tooltip";
import { MdOutlineDangerous } from "react-icons/md";
import { toastr } from "react-redux-toastr";

import { Container, InputText, InputNumber, Label, ModalConfirmation } from "@snu/ds/admin";

import { canCreateOrUpdateCohesionCenter, canPutSpecificDateOnSessionPhase1, isSessionEditionOpen, validateEmailAcademique } from "snu-lib";
import { capture } from "@/sentry";
import api from "@/services/api";
import dayjs from "@/utils/dayjs.utils";
import Pencil from "@/assets/icons/Pencil";
import { CohortState } from "@/redux/cohorts/reducer";
import { AuthState } from "@/redux/auth/reducer";
import { Center, Session } from "@/types";
import Trash from "@/assets/icons/Trash";
import SessionHorizontalBar from "@/scenes/dashboardV2/components/graphs/SessionHorizontalBar";

import ToggleDate from "@/components/ui/forms/dateForm/ToggleDate";
import SelectCohort from "@/components/cohorts/SelectCohort";

import { Title } from "../commons";
import TimeSchedule from "../TimeSchedule";
import PedagoProject from "../PedagoProject";
import { getDefaultSession } from "@/utils/session";

type Props = {
  center: Center;
  setCenter: React.Dispatch<React.SetStateAction<Center>>;
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
};

type Errors = {
  [key: string]: string;
};

export default function SessionList({ center, setCenter, sessions, setSessions }: Props) {
  const history = useHistory();
  const cohorts = useSelector((state: CohortState) => state.Cohorts);
  const user = useSelector((state: AuthState) => state.Auth.user);

  const cohortParam = new URLSearchParams(location.search).get("cohorte");
  const session = cohortParam ? sessions.find((session) => session.cohort === cohortParam) : getDefaultSession(sessions, cohorts);
  const cohort = cohorts.find((cohort) => cohort.name === session?.cohort);
  const setSession = (newSession: Session) => setSessions(sessions.map((session) => (session._id === newSession._id ? newSession : session)));

  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<Session | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [showModalDelete, setShowModalDelete] = useState(false);

  if (!session || !cohort) return <div></div>;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values) return;

    const errorsObject: Errors = {};
    if (isNaN(values.placesTotal)) {
      errorsObject.placesTotal = "Le nombre de places est incorrect";
    } else if (center.placesTotal && values.placesTotal > center.placesTotal) {
      errorsObject.placesTotal = "Le nombre de places ne peut pas être supérieur à la capacité du centre";
    } else if (values.placesTotal < session.placesTotal - session.placesLeft) {
      errorsObject.placesTotal = "Le nombre de places total est inférieur au nombre d'inscrits";
    }
    if (values.dateStart && values.dateEnd && new Date(values.dateStart) > new Date(values.dateEnd)) {
      errorsObject.date = "La date de début doit être antérieure à la date de fin";
    }
    if (values.sanitaryContactEmail) {
      if (!validateEmailAcademique(values.sanitaryContactEmail)) {
        errorsObject.sanitaryContactEmail = "L’adresse email ne semble pas valide. Veuillez vérifier qu’il s’agit bien d’une adresse académique.";
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
      setShowModalDelete(false);
      setCenter({ ...center, cohorts: center.cohorts.filter((cohort) => cohort !== session.cohort) });
      setSessions(sessions.filter((s) => s._id !== session._id));
      history.push({ search: `?cohorte=${center.cohorts[0]}` });
      toastr.success("La session a bien été supprimée", "");
    } catch (e) {
      capture(e);
      setLoading(false);
      setShowModalDelete(false);
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
        dateStart: session?.dateStart || cohort?.dateStart?.toString() || new Date().toString(),
        dateEnd: session?.dateEnd || cohort?.dateEnd?.toString() || new Date().toString(),
      });
    }
  };

  const handleSelect = (cohortName: string) => {
    history.push(`?cohorte=${cohortName}`);
  };

  return (
    <div className="mx-8 my-4 space-y-4">
      <form onSubmit={handleSubmit} id="session-form">
        <div className="flex items-center justify-between mb-3">
          <Title>Par séjour</Title>
          <SelectCohort cohort={session?.cohort} withBadge filterFn={(c) => Boolean(sessions.find((s) => s.cohort === c.name))} onChange={handleSelect} key="selectCohort" />
        </div>
        <Container
          title="Détails"
          actions={[
            isSessionEditionOpen(user, cohort) && (
              <>
                {values ? (
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
                ) : (
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setValues(session)}
                    disabled={loading}>
                    <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
                    Modifier
                  </button>
                )}
              </>
            ),
          ]}>
          <div className="flex flex-row">
            <div className="w-[45%]">
              <div className="rounded-lg bg-white mb-4">
                <SessionHorizontalBar
                  title="Places"
                  labels={["occupés", "disponibles"]}
                  values={[session.placesTotal - session.placesLeft || 0, session.placesLeft || 0]}
                  goal={session.placesTotal}
                  showTooltips={true}
                />
              </div>
              <div className="flex w-full flex-col items-start justify-center">
                <div className="w-full">
                  <Label
                    className="text-xs leading-5 font-medium mt-2"
                    title="Places ouvertes"
                    name="placesTotal"
                    tooltip="C’est le nombre de places proposées sur un séjour. Cette donnée doit être inférieure ou égale à la capacité maximale d’accueil, elle ne peut lui être supérieure."
                  />
                  <InputNumber
                    label=""
                    name="placesTotal"
                    value={values ? values?.placesTotal : session.placesTotal}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const parsedValue = parseInt(inputValue, 10);
                      if (values) setValues({ ...values, placesTotal: parsedValue });
                    }}
                  />
                </div>
              </div>
              {center?.region === "Provence-Alpes-Côte d'Azur" && cohort?.name === "Juin 2024 - 2" && (
                <>
                  <div className="flex flex-call justify-start items-center w-full mt-2">
                    <div className="w-full mt-3">
                      <Label
                        className="text-xs leading-5 font-medium"
                        title="Réception des fiches sanitaires (facultatif)"
                        name="sanitaryContactEmail"
                        tooltip="Si vous renseignez l'adresse email suivante, elle sera visible sur l'espace personnel des volontaires. Ils seront ainsi invités à envoyer leurs fiches sanitaires à cette adresse. Seules les adresses emails académiques sécurisées sont autorisées."
                      />
                      <InputText
                        label="Adresse email académique"
                        name="sanitaryContactEmail"
                        value={values ? values.sanitaryContactEmail : session.sanitaryContactEmail}
                        onChange={(e) => {
                          if (values) setValues({ ...values, sanitaryContactEmail: e.target.value });
                        }}
                      />
                    </div>
                  </div>
                  {errors?.sanitaryContactEmail && <div className="text-[#EF4444] mx-auto mt-1">{errors?.sanitaryContactEmail}</div>}
                </>
              )}
            </div>
            <div className="flex w-[10%] items-center justify-center">
              <div className="h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
            </div>
            <div className="w-[45%]">
              <p className="mb-3">Dates du séjour</p>
              <div className="flex flex-col w-full">
                <div className="flex flex-col gap-2 rounded-lg bg-gray-100 px-3 py-2 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-left text-sm text-gray-800">Dates officielles</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-left text-xs text-gray-500">
                      Début : <strong>{cohort ? dayjs(cohort.dateStart).format("DD/MM/YYYY") : ""}</strong>
                    </p>
                    <p className="text-left text-xs text-gray-500 mr-3.5">
                      Fin : <strong>{cohort ? dayjs(cohort.dateEnd).format("DD/MM/YYYY") : ""}</strong>
                    </p>
                    <p className="text-left text-xs text-gray-500"></p>
                  </div>
                  {errors?.date && <div className="text-[#EF4444] mx-auto mt-1">{errors?.date}</div>}
                </div>
              </div>
              <div className="flex flex-col w-full">
                <ToggleDate
                  label="Dates spécifiques"
                  className="bg-white border"
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
                    if (values) setValues({ ...values, dateStart: range?.from.toString(), dateEnd: range?.to.toString() });
                  }}
                />
                {errors?.date && <div className="text-[#EF4444] mx-auto mt-1">{errors?.date}</div>}
              </div>
              <div className="flex mt-8 text-blue-600">
                <div className="flex max-w-xl flex-1 flex-col items-center justify-between gap-2 bg-white">
                  <div className="flex w-full flex-1 items-center justify-center rounded-md border-[1px] border-blue-300 bg-blue-100 mb-2">
                    <Link className="rounded-md px-4 py-2 text-sm" to={`/centre/${center._id}/${session._id}/general`}>
                      Voir les volontaires
                    </Link>
                  </div>
                  <div className="flex w-full flex-1 items-center justify-center rounded-md border-[1px] border-blue-300 bg-blue-100">
                    <Link className="rounded-md px-4 py-2 text-sm" to={`/centre/${center._id}/${session._id}/equipe`}>
                      Voir l&apos;équipe
                    </Link>
                  </div>
                </div>
              </div>
              {canCreateOrUpdateCohesionCenter(user) && (
                <div data-tip="" data-for="tooltip-delete-session">
                  {!session.canBeDeleted && (
                    <ReactTooltip id="tooltip-delete-session" className="bg-white text-black shadow-xl" arrowColor="white" disable={false}>
                      <div className="text-[black]">Des jeunes sont encore associés à ce séjour ou une ligne de bus dessert ce centre dans le PDT</div>
                    </ReactTooltip>
                  )}
                  <button
                    type="button"
                    disabled={!session.canBeDeleted}
                    onClick={() => {
                      session.canBeDeleted && setShowModalDelete(true);
                    }}
                    className={cx("mt-3 flex w-full flex-row items-center justify-end gap-2", { "cursor-pointer": session.canBeDeleted })}>
                    <Trash className={cx({ "text-red-400": session.canBeDeleted, "text-gray-400": !session.canBeDeleted })} width={14} height={14} />
                    <div className={cx("text-xs", { "text-gray-800": session.canBeDeleted, "text-gray-500": !session.canBeDeleted })}>Supprimer le séjour</div>
                  </button>
                  <ModalConfirmation
                    isOpen={showModalDelete}
                    onClose={() => setShowModalDelete(false)}
                    className="md:max-w-[700px]"
                    title="Supprimer la session"
                    text="Êtes-vous sûr de vouloir supprimer cette session ?"
                    actions={[
                      { title: "Annuler", isCancel: true },
                      {
                        title: "Confirmer",
                        leftIcon: <MdOutlineDangerous size={20} />,
                        onClick: () => handleSessionDelete(),
                        isDestructive: true,
                      },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>
        </Container>
      </form>
      <div className="flex w-full mt-4 gap-2 pb-4 justify-center">
        <PedagoProject session={session} className="p-1" setSession={setSession} />
        <TimeSchedule session={session} className="p-1" setSession={setSession} />
      </div>
    </div>
  );
}
