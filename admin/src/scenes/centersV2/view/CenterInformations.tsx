import React, { useState } from "react";
import { useSelector } from "react-redux";
import { BiHandicap } from "react-icons/bi";
// @ts-expect-error lib non ts
import { useDebounce } from "@uidotdev/usehooks";

import ReactTooltip from "react-tooltip";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { useAddress, canUpdateMeetingPoint, departmentToAcademy } from "snu-lib";
import { AddressForm } from "@snu/ds/common";

import { AuthState } from "@/redux/auth/reducer";
import { capture } from "@/sentry";
import { canCreateOrUpdateCohesionCenter, ROLES } from "@/utils";
import Pencil from "@/assets/icons/Pencil";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import api from "@/services/api";

import { Center } from "@/types";
import ModalRattacherCentre from "../components/ModalRattacherCentre";
import ModalConfirmDelete from "../components/ModalConfirmDelete";
import { Title } from "../components/commons";
import Field from "../components/Field";
import Toggle from "../components/Toggle";
import Select from "../components/Select";

type Error = { [key: string]: string };

const optionsTypology = [
  { label: "Public / État", value: "PUBLIC_ETAT" },
  { label: "Public / Collectivité territoriale", value: "PUBLIC_COLLECTIVITE" },
  { label: "Privé / Association ou fondation", value: "PRIVE_ASSOCIATION" },
  { label: "Privé / Autre", value: "PRIVE_AUTRE" },
  { label: "", value: "" },
];

const optionsDomain = [
  { label: "Etablissement d’enseignement", value: "ETABLISSEMENT" },
  { label: "Centre de vacances", value: "VACANCES" },
  { label: "Centre de formation", value: "FORMATION" },
  { label: "Autres", value: "AUTRE" },
  { label: "", value: "" },
];

export default function Details({ center, setCenter, sessions, setSessions }) {
  const history = useHistory();

  const user = useSelector((state: AuthState) => state.Auth.user);
  const [modalVisible, setModalVisible] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { results } = useAddress({ query: debouncedQuery, options: { limit: 10 }, enabled: debouncedQuery.length > 2 });
  const [modalDelete, setModalDelete] = React.useState<{ isOpen: boolean; title?: string; message?: string; onDelete?: () => void }>({ isOpen: false });

  const [isLoading, setIsLoading] = useState(false);
  const [editInfo, setEditInfo] = React.useState(false);
  const [errors, setErrors] = React.useState<Error>({});
  const [data, setData] = useState<Center>({ ...center, academy: departmentToAcademy[center.department], pmr: center?.pmr ? center.pmr : "false" });
  useDocumentTitle(`Fiche du centre - ${center?.name}`);

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      const error: Error = {};
      if (!data?.name) {
        error.name = "Le nom est obligatoire";
      }
      if (!data?.address) {
        error.address = "L'adresse est obligatoire";
      }
      if (!data?.city) {
        error.city = "La ville est obligatoire";
      }
      if (!data?.zip) {
        error.zip = "Le code postal est obligatoire";
      }
      if (!data?.placesTotal || isNaN(data?.placesTotal as number)) {
        error.placesTotal = "Le nombre de places est incorrect";
      }
      if (!data?.code2022) {
        error.code2022 = "Le code est obligatoire";
      }
      if (!data?.typology) error.typology = "La typologie est obligatoire";
      if (!data?.domain) error.domain = "Le domaine est obligatoire";
      data.academy = departmentToAcademy[data.department];

      // check session
      const canUpdateSession = sessions.filter((s) => s.placesTotal > (data?.placesTotal || 0)).length === 0;
      if (!canUpdateSession) {
        error.placesTotal = "La capacité maximale est inférieur à la capacité de l'une des sessions";
      }
      setErrors(error);
      if (Object.keys(error).length > 0) return setIsLoading(false);
      const { ok, code, data: returnedData } = await api.put(`/cohesion-center/${center._id}`, data);
      if (!ok) {
        if (code === "ALREADY_EXISTS") {
          toastr.error("Oups, le code du centre est déjà utilisé", "");
        } else {
          toastr.error("Oups, une erreur est survenue lors de la modification du centre", code);
        }
        return setIsLoading(false);
      }
      setIsLoading(false);
      setErrors({});
      setCenter(returnedData);
      setEditInfo(false);
      toastr.success("Le centre a été modifié avec succès", "");
    } catch (e) {
      capture(e);
      if (e.code === "ALREADY_EXISTS") {
        toastr.error("Oups, le code du centre est déjà utilisé", "");
      } else {
        toastr.error("Oups, une erreur est survenue lors de la modification du centre", "");
      }
      setIsLoading(false);
    }
  };
  const onDelete = async () => {
    try {
      setIsLoading(true);
      const { ok, code } = await api.remove(`/cohesion-center/${data?._id}`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la suppression du centre", code);
        return setIsLoading(false);
      }
      toastr.success("Le centre a bien été supprimé", "");
      history.push("/centre");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la suppression du centre", "");
      setIsLoading(false);
    }
  };

  const handleSuccess = async (newSession) => {
    setCenter({ ...center, cohorts: [...center.cohorts, newSession.cohort] });
    setSessions([...sessions, newSession]);
    history.push(`?cohorte=${newSession.cohort}`);
  };

  if (!data) return <></>;
  return (
    <div className="m-8 flex flex-col gap-6">
      {/*TODO : SET Centre par défaut + cohorte disponible ?*/}
      <ModalRattacherCentre editable={false} defaultCentre={center} isOpen={modalVisible} onSuccess={handleSuccess} onCancel={() => setModalVisible(false)} user={user} />
      <ModalConfirmDelete
        isOpen={modalDelete.isOpen}
        title={modalDelete.title}
        message={modalDelete.message}
        onCancel={() => setModalDelete({ isOpen: false })}
        onDelete={() => {
          setModalDelete({ isOpen: false });
          modalDelete.onDelete?.();
        }}
      />
      <div className="flex items-center justify-between">
        <Title>{data.name}</Title>
        <div className="flex items-center gap-2">
          {user.role === ROLES.ADMIN ? (
            <div data-tip="" data-for="tooltip-delete">
              {sessions.length !== 0 && (
                <ReactTooltip id="tooltip-delete" className="bg-white text-black shadow-xl" arrowColor="white" disable={false}>
                  <div className="text-[black]">Des sessions sont encore associées au centre</div>
                </ReactTooltip>
              )}

              <button
                className="rounded-lg border-[1px] border-red-600 bg-red-600 px-4 py-2 text-white shadow-sm transition duration-300 ease-in-out hover:bg-white hover:!text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() =>
                  setModalDelete({
                    isOpen: true,
                    title: "Supprimer le centre",
                    message: "Êtes-vous sûr de vouloir supprimer ce centre?",
                    onDelete: onDelete,
                  })
                }
                disabled={isLoading || sessions.length !== 0}>
                Supprimer
              </button>
            </div>
          ) : null}
          {canCreateOrUpdateCohesionCenter(user) ? (
            <button
              className="rounded-lg border-[1px] border-blue-600 bg-blue-600 px-4 py-2 text-white shadow-sm transition duration-300 ease-in-out hover:bg-white hover:!text-blue-600"
              onClick={() => setModalVisible(true)}>
              Rattacher un centre à un séjour
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-8 rounded-lg bg-white px-8 pt-8 pb-12">
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium leading-6 text-gray-900">Informations générales</div>
          {canUpdateMeetingPoint(user) ? (
            <>
              {!editInfo ? (
                <button
                  className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setEditInfo(true)}
                  disabled={isLoading}>
                  <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
                  Modifier
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs font-medium leading-5 text-gray-700 hover:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => {
                      setEditInfo(false);
                      setData(center);
                      setErrors({});
                    }}
                    disabled={isLoading}>
                    Annuler
                  </button>
                  <button
                    className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs font-medium leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={onSubmit}
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
              <div className="text-xs font-medium leading-4 text-gray-900">Nom du centre</div>
              <Field readOnly={!editInfo} label="Nom du centre" onChange={(e) => setData({ ...data, name: e.target.value })} value={data.name || ""} error={errors?.name} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center rounded-full bg-gray-100 p-2 ">
                  <BiHandicap className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="text-sm font-bold leading-5 text-gray-700">Accessibilité PMR</div>
                  <div className="text-sm leading-5 text-gray-700">{data.pmr === "true" ? "Oui" : "Non"}</div>
                </div>
              </div>
              <Toggle disabled={!editInfo} value={data.pmr === "true"} onChange={(e) => setData({ ...data, pmr: e.toString() })} />
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-xs font-medium leading-4 text-gray-900">Adresse</div>

              <AddressForm
                readOnly={!editInfo}
                data={{
                  address: data.address,
                  zip: data.zip,
                  city: data.city,
                  department: data.department,
                  region: data.region,
                }}
                updateData={(newData) => setData({ ...data, ...newData, academy: departmentToAcademy[newData.department] })}
                query={query}
                setQuery={setQuery}
                options={results}
              />

              {data.address && (
                <>
                  <div className="flex items-center gap-3">
                    <Field label="Département" value={data.department} disabled onChange={() => {}} />
                    <Field label="Région" value={data.region} disabled onChange={() => {}} />
                  </div>
                  <Field label="Académie" value={"Académie de " + data.academy} disabled onChange={() => {}} />
                </>
              )}
            </div>
          </div>
          <div className="flex w-[10%] items-center justify-center">
            <div className="h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
          </div>
          <div className="flex w-[45%] flex-col  justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium text-gray-900">Détails</div>
                <div className="flex flex-col gap-2">
                  <Select
                    label="Typologie"
                    readOnly={!editInfo}
                    options={optionsTypology}
                    selected={optionsTypology.find((e) => e.value === data.typology)}
                    error={errors?.typology}
                    setSelected={(e) => {
                      setData({ ...data, typology: e.value });
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Select
                  label="Domaine"
                  readOnly={!editInfo}
                  options={optionsDomain}
                  selected={optionsDomain.find((e) => e.value === data.domain)}
                  setSelected={(e) => setData({ ...data, domain: e.value })}
                  error={errors?.domain}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Field
                  readOnly={!editInfo}
                  label="Précisez le gestionnaire ou propriétaire"
                  onChange={(e) => setData({ ...data, complement: e.target.value })}
                  value={data.complement || ""}
                  error={errors?.complement}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Field
                  readOnly={!editInfo}
                  label="Capacité maximale d'accueil"
                  onChange={(e) => setData({ ...data, placesTotal: parseInt(e.target.value) })}
                  value={data.placesTotal}
                  error={errors?.placesTotal}
                  tooltips={
                    "C’est la capacité d’hébergement maximale du centre, qui dépend du bâti. Elle doit être supérieure ou égale au nombre de places ouvertes sur un séjour donné"
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Field
                  readOnly={!editInfo}
                  label="Désignation du centre"
                  onChange={(e) => setData({ ...data, centerDesignation: e.target.value })}
                  value={data.centerDesignation || ""}
                  error={errors?.centerDesignation}
                  disabled={user.role !== "admin" && editInfo}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Field
                  readOnly={!editInfo}
                  label="Code du centre"
                  onChange={(e) => setData({ ...data, code2022: e.target.value })}
                  value={data.code2022 || ""}
                  error={errors?.code2022}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
