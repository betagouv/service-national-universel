import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import ReactTooltip from "react-tooltip";

import {
  useAddress,
  canCreateMeetingPoint,
  canDeleteMeetingPoint,
  canDeleteMeetingPointSession,
  canUpdateMeetingPoint,
  canViewMeetingPointId,
  isPdrEditionOpen,
  ROLES,
  START_DATE_SESSION_PHASE1,
} from "snu-lib";
import { AddressForm } from "@snu/ds/common";
import { useDebounce } from "@uidotdev/usehooks";

import { capture } from "@/sentry";
import api from "@/services/api";

import Pencil from "@/assets/icons/Pencil";
import Trash from "@/assets/icons/Trash";

import Breadcrumbs from "@/components/Breadcrumbs";
import Loader from "@/components/Loader";
import SelectCohort from "@/components/cohorts/SelectCohort";

import { Title } from "./components/common";
import Field from "./components/Field";
import ModalConfirmDelete from "./components/ModalConfirmDelete";
import ModalCreation from "./components/ModalCreation";

export default function View(props) {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);

  const urlParams = new URLSearchParams(window.location.search);

  const mount = React.useRef(false);

  const [pdr, setPdr] = React.useState(null);
  const [modalCreation, setModalCreation] = React.useState({ isOpen: false });
  const [modalDelete, setModalDelete] = React.useState({ isOpen: false });
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [editInfo, setEditInfo] = React.useState(false);
  const [editSession, setEditSession] = React.useState(false);
  const [currentCohort, setCurrentCohort] = React.useState("");
  const [currentCohortDetails, setCurrentCohortDetails] = React.useState({});
  const [nbYoung, setNbYoung] = React.useState([]);
  const [lines, setLines] = React.useState([]);
  const [pdrInSchema, setPdrInSchema] = React.useState(false);
  const [query, setQuery] = useState("");

  const debouncedQuery = useDebounce(query, 300);
  const { results } = useAddress({ query: debouncedQuery, options: { limit: 10 }, enabled: debouncedQuery.length > 2 });

  useEffect(() => {
    (async () => {
      if (currentCohort) {
        const { data } = await api.get(`/cohort/${currentCohort}`);
        if (!data) return;
        setCurrentCohortDetails(data);
      }
    })();
  }, [currentCohort]);

  const setYoungsFromES = async (id) => {
    const { responses } = await api.post("/elasticsearch/young/by-point-de-rassemblement/aggs", { filters: { meetingPointIds: [id], cohort: [] } });
    setNbYoung(responses[0].aggregations.group_by_cohort.buckets.map((b) => ({ cohort: b.key, count: b.doc_count })));
  };

  const setLinesFromES = async (id) => {
    const { responses } = await api.post("/elasticsearch/lignebus/by-point-de-rassemblement/aggs", { filters: { meetingPointIds: [id], cohort: [] } });
    setLines(responses[0].aggregations.group_by_cohort.buckets.map((b) => ({ cohort: b.key, count: b.doc_count })));
  };

  const loadPDR = async () => {
    try {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      const { ok, code, data: reponsePDR } = await api.get(`/point-de-rassemblement/${id}`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération du point de rassemblement", code);
        return history.push("/point-de-rassemblement");
      }
      setPdr({ ...reponsePDR, addressVerified: true });

      //check if pdr is in schema
      const { ok: okSchema, code: codeSchema, data: reponseSchema } = await api.get(`/point-de-rassemblement/${reponsePDR._id.toString()}/in-schema`);
      if (!okSchema) {
        toastr.error("Oups, une erreur est survenue lors de la récupération du point de rassemblement", codeSchema);
        return history.push("/point-de-rassemblement");
      }
      setPdrInSchema(reponseSchema);

      await setYoungsFromES(id);
      await setLinesFromES(id);

      return reponsePDR;
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du point de rassemblement");
    }
  };

  React.useEffect(() => {
    (async () => {
      if (mount.current === false) {
        const pdrUpdated = await loadPDR();
        setCurrentCohort(urlParams.get("cohort") || pdrUpdated?.cohorts?.[0] || "");
        mount.current = true;
      }
    })();
  }, [props.match.params.id]);

  React.useEffect(() => {
    if (editInfo === false || editSession === false) {
      loadPDR();
      setErrors({});
    }
  }, [editInfo, editSession]);

  const handleChangeComplement = (e) => {
    let complementAddressToUpdate = pdr.complementAddress;
    complementAddressToUpdate = complementAddressToUpdate.filter((c) => c.cohort !== currentCohort);
    complementAddressToUpdate.push({ cohort: currentCohort, complement: e, edit: true });
    setPdr({ ...pdr, complementAddress: complementAddressToUpdate });
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const { ok, code } = await api.remove(`/point-de-rassemblement/${pdr._id}`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la suppression du point de rassemblement", code);
        return setIsLoading(false);
      }
      toastr.success("Le point de rassemblement a bien été supprimé");
      history.push("/point-de-rassemblement");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la suppression du point de rassemblement");
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    try {
      setIsLoading(true);
      const { ok, code, data: PDR } = await api.put(`/point-de-rassemblement/delete/cohort/${pdr._id}`, { cohort: currentCohort });
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la suppression du séjour", code);
        return setIsLoading(false);
      }
      toastr.success("Le séjour a bien été supprimé");
      setCurrentCohort(PDR?.cohorts?.sort((a, b) => START_DATE_SESSION_PHASE1[a] - START_DATE_SESSION_PHASE1[b])[0]);
      setPdr(PDR);
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la suppression du séjour");
      setIsLoading(false);
    }
  };

  const handleSubmitInfo = async () => {
    try {
      setIsLoading(true);
      const error = {};
      if (!pdr?.name) {
        error.name = "Le nom est obligatoire";
      }
      if (!pdr?.address) {
        error.address = "L'adresse est obligatoire";
      }
      if (!pdr?.city) {
        error.city = "La ville est obligatoire";
      }
      if (!pdr?.zip) {
        error.zip = "Le code postal est obligatoire";
      }
      console.log(error);
      setErrors(error);
      if (Object.keys(error).length > 0) return setIsLoading(false);
      const {
        ok,
        code,
        data: PDR,
      } = await api.put(`/point-de-rassemblement/${pdr._id}`, {
        name: pdr.name,
        address: pdr.address,
        city: pdr.city,
        zip: pdr.zip,
        department: pdr.department,
        region: pdr.region,
        location: pdr.location,
      });

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la création du point de rassemblement", code);
        return setIsLoading(false);
      }
      setPdr(PDR);
      setEditInfo(false);
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la création du point de rassemblement");
      setIsLoading(false);
    }
  };

  const handleSubmitSession = async () => {
    try {
      setIsLoading(true);
      const complementAddressToUpdate = pdr.complementAddress;
      for await (const infoToUpdate of complementAddressToUpdate) {
        if (infoToUpdate?.edit) {
          const {
            ok,
            code,
            data: PDR,
          } = await api.put(`/point-de-rassemblement/cohort/${pdr._id}`, {
            cohort: infoToUpdate.cohort,
            complementAddress: infoToUpdate.complement,
          });

          if (!ok) {
            toastr.error("Oups, une erreur est survenue lors de la modifications des compléments d'adresse", code);
            return setIsLoading(false);
          }
          setPdr(PDR);
        }
      }

      setEditSession(false);
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modifications des compléments d'adresse");
      setIsLoading(false);
    }
  };

  if (!pdr) return <Loader />;

  return (
    <>
      <Breadcrumbs items={[{ label: "Point de rassemblement", to: "/point-de-rassemblement/liste/liste-points" }, { label: "Fiche point de rassemblement" }]} />
      <div className="m-8 flex flex-col gap-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <Title>{pdr.name}</Title>
          <div className="flex items-center gap-2">
            {canDeleteMeetingPoint(user) ? (
              <button
                className="rounded-lg border-[1px] border-red-600 bg-red-600 px-4 py-2 text-white shadow-sm transition duration-300 ease-in-out hover:bg-white hover:!text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() =>
                  setModalDelete({
                    isOpen: true,
                    title: "Supprimer le point de rassemblement",
                    message: "Êtes-vous sûr de vouloir supprimer ce point de rassemblement ?",
                    onDelete: handleDelete,
                  })
                }
                disabled={isLoading}>
                Supprimer
              </button>
            ) : null}
            {canCreateMeetingPoint(user) ? (
              <button
                className="rounded-lg border-[1px] border-blue-600 bg-blue-600 px-4 py-2 text-white shadow-sm transition duration-300 ease-in-out hover:bg-white hover:!text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setModalCreation({ isOpen: true })}
                disabled={isLoading}>
                Rattacher le point à un séjour
              </button>
            ) : null}
          </div>
        </div>
        {/* INFOS */}
        <div className="flex flex-col gap-8 rounded-lg bg-white px-8 pt-8 pb-12">
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium leading-6 text-gray-900">Informations générales</div>
            {canUpdateMeetingPoint(user, pdr) ? (
              <>
                {!editInfo ? (
                  <div data-tip="" data-for="tooltip-edit-disabled">
                    {pdrInSchema && user.role !== ROLES.ADMIN && (
                      <ReactTooltip id="tooltip-edit-disabled" className="rounded-xl bg-white shadow-xl drop-shadow-sm" arrowColor="white" disable={false}>
                        <div className="text-center text-gray-700">
                          Action impossible : point de rassemblement utilisé dans un schéma de répartition. <br />
                          Rapprochez-vous de la Sous-Direction
                        </div>
                      </ReactTooltip>
                    )}
                    <button
                      className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setEditInfo(true)}
                      disabled={isLoading || (pdrInSchema && user.role !== ROLES.ADMIN)}>
                      <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
                      Modifier
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs font-medium leading-5 text-gray-700 hover:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setEditInfo(false)}
                      disabled={isLoading}>
                      Annuler
                    </button>
                    <button
                      className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={handleSubmitInfo}
                      disabled={isLoading}>
                      <Pencil stroke="#2563EB" className="mr-[6px] h-[12px] w-[12px]" />
                      Enregistrer les changements
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
          <div className="flex">
            <div className="flex w-[45%] flex-col gap-4 ">
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium leading-4 text-gray-900">Nom du point de rassemblement</div>
                <Field
                  label={"Nom du point de rassemblement"}
                  onChange={(e) => setPdr({ ...pdr, name: e.target.value })}
                  value={pdr.name}
                  error={errors?.name}
                  readOnly={!editInfo}
                />
              </div>
            </div>
            <div className="flex w-[10%] items-center justify-center">
              <div className="h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
            </div>
            <div className="flex w-[45%] flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="text-xs font-medium leading-4 text-gray-900">Adresse</div>

                <AddressForm
                  readOnly={!editInfo}
                  data={{ address: pdr.address, zip: pdr.zip, city: pdr.city }}
                  updateData={(address) => setPdr({ ...pdr, ...address, addressVerified: true })}
                  query={query}
                  setQuery={setQuery}
                  options={results}
                />
                <div className="flex items-center gap-3">
                  <Field label="Département" onChange={(e) => setPdr({ ...pdr, department: e.target.value })} value={pdr.department} readOnly={true} disabled={editInfo} />
                  <Field label="Région" onChange={(e) => setPdr({ ...pdr, region: e.target.value })} value={pdr.region} readOnly={true} disabled={editInfo} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* SEJOUR */}
        {pdr?.cohorts?.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Title>Par séjour</Title>
              <SelectCohort
                cohort={currentCohort}
                filterFn={(c) => pdr.cohorts.find((name) => c.name === name)}
                withBadge
                onChange={(cohortName) => {
                  setCurrentCohort(cohortName);
                  history.replace({ search: `?cohort=${cohortName}` });
                }}
              />
            </div>
            <div className="flex flex-col px-8 py-4 gap-4 mb-8 rounded-lg bg-white z-0">
              <div className="flex items-center justify-between">
                <div className="text-lg font-medium leading-6 text-gray-900">Détails</div>
                {canUpdateMeetingPoint(user, pdr) && isPdrEditionOpen(user, currentCohortDetails) && (
                  <>
                    {!editSession ? (
                      <button
                        className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => setEditSession(true)}
                        disabled={isLoading}>
                        <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
                        Modifier
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs font-medium leading-5 text-gray-700 hover:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => setEditSession(false)}
                          disabled={isLoading}>
                          Annuler
                        </button>
                        <button
                          className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={handleSubmitSession}
                          disabled={isLoading}>
                          <Pencil stroke="#2563EB" className="mr-[6px] h-[12px] w-[12px]" />
                          Enregistrer les changements
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex h-64 w-full px-8">
                <div className="relative flex w-1/3 items-center justify-center  border-r-[1px] border-gray-200 p-4">
                  {canViewMeetingPointId(user) && <Field label="ID" value={pdr.code} copy={true} />}
                  {canDeleteMeetingPointSession(user) ? (
                    <button
                      className="absolute bottom-5 right-5 flex cursor-pointer items-center gap-2 px-2 py-1 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() =>
                        setModalDelete({
                          isOpen: true,
                          onDelete: handleDeleteSession,
                          title: "Supprimer la session",
                          message: "Êtes-vous sûr de vouloir supprimer cette session ?",
                        })
                      }
                      disabled={isLoading}>
                      <Trash className="h-4 w-4 text-red-400" />
                      <div className="text-xs font-medium leading-4 text-gray-800">Supprimer le séjour</div>
                    </button>
                  ) : null}
                </div>
                <div className="flex w-1/3 flex-col items-center justify-center  border-r-[1px] border-gray-200">
                  <div
                    className="flex h-1/2 w-full cursor-pointer items-center justify-center border-y-[1px] border-gray-200 text-sm font-medium leading-4 text-gray-900 hover:underline"
                    onClick={() => history.push(`/ligne-de-bus/volontaires/point-de-rassemblement/${pdr._id.toString()}?cohort=${currentCohort}`)}>
                    Voir les volontaires ({nbYoung.find((n) => n.cohort === currentCohort)?.count || 0})
                  </div>
                  <div
                    className="flex h-1/2 w-full cursor-pointer items-center justify-center border-b-[1px] border-gray-200 text-sm font-medium leading-4 text-gray-900 hover:underline"
                    onClick={() => history.push(`/ligne-de-bus?cohort=${currentCohort}&pointDeRassemblements.code=${pdr.code}`)}>
                    Liste des lignes de transports ({lines.find((l) => l.cohort === currentCohort)?.count || 0})
                  </div>
                </div>
                <div className="flex w-1/3 items-center justify-center p-4">
                  <Field
                    label="Complément d’adresse"
                    onChange={(e) => handleChangeComplement(e.target.value)}
                    value={pdr.complementAddress.find((c) => c.cohort === currentCohort)?.complement || ""}
                    readOnly={!editSession}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <ModalCreation
        isOpen={modalCreation.isOpen}
        onCancel={async (cohort) => {
          setModalCreation({ isOpen: false });
          await loadPDR();
          setCurrentCohort(cohort);
        }}
        defaultPDR={pdr}
        editable={false}
      />
      <ModalConfirmDelete
        isOpen={modalDelete.isOpen}
        title={modalDelete.title}
        message={modalDelete.message}
        onCancel={() => setModalDelete({ isOpen: false })}
        onDelete={() => {
          setModalDelete({ isOpen: false });
          modalDelete.onDelete();
        }}
      />
    </>
  );
}
