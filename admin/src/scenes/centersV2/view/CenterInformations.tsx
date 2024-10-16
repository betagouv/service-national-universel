import React, { useState } from "react";
import { useSelector } from "react-redux";
import { BiHandicap } from "react-icons/bi";
// @ts-expect-error lib non ts
import { useDebounce } from "@uidotdev/usehooks";

import ReactTooltip from "react-tooltip";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { Badge, Button } from "@snu/ds/admin";

import { useAddress, departmentToAcademy } from "snu-lib";
import { AddressForm } from "@snu/ds/common";

import { AuthState } from "@/redux/auth/reducer";
import { capture } from "@/sentry";
import { canCreateOrUpdateCohesionCenter, ROLES } from "@/utils";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import api from "@/services/api";
import { InputText } from "@snu/ds/admin";

import { Center } from "@/types";
import ModalRattacherCentre from "../components/ModalRattacherCentre";
import ModalConfirmDelete from "../components/ModalConfirmDelete";
import { Title } from "../components/commons";
import Toggle from "../components/Toggle";

type Error = { [key: string]: string };

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
  const [data, setData] = useState<Center>({ ...center, pmr: center?.pmr ? center.pmr : "false" });
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
      if (!data?.academy) error.academy = "L'académie est obligatoire";

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
  const handleDelete = async () => {
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
        {data?.deletedAt && <Badge title="Archivé" status="WAITING_CORRECTION" />}
        <div className="flex items-center gap-2">
          {user.role === ROLES.ADMIN ? (
            <div data-tip="" data-for="tooltip-delete">
              {sessions.length !== 0 && (
                <ReactTooltip id="tooltip-delete" className="bg-white text-black shadow-xl" arrowColor="white" disable={false}>
                  <div className="text-[black]">Des sessions sont encore associées au centre</div>
                </ReactTooltip>
              )}
              {data?.deletedAt && (
                <ReactTooltip id="tooltip-delete" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md" arrowColor="white">
                  <div className="w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">Les informations doivent être mises à jour dans le SI SNU</div>
                </ReactTooltip>
              )}

              <Button
                title="Supprimer"
                type="danger"
                onClick={() =>
                  setModalDelete({
                    isOpen: true,
                    title: "Supprimer le centre",
                    message: "Êtes-vous sûr de vouloir supprimer ce centre?",
                    onDelete: handleDelete,
                  })
                }
                disabled={isLoading || sessions.length !== 0 || !!data?.deletedAt}></Button>
            </div>
          ) : null}
          {canCreateOrUpdateCohesionCenter(user) ? (
            <Button
              title="Rattacher un centre à un séjou"
              onClick={() => setModalVisible(true)}
              disabled={!!data?.deletedAt}
              tooltip="Les informations doivent être mises à jour dans le SI SNU"></Button>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-8 rounded-lg bg-white px-8 pt-8 pb-12">
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium leading-6 text-gray-900">Informations générales</div>
        </div>
        <div className="flex">
          <div className="flex w-[45%] flex-col gap-4 ">
            <div className="flex flex-col gap-2">
              <div className="text-xs font-medium leading-4 text-gray-900">Nom du centre</div>
              <InputText name="nameCenter" label="Nom du centre" className="flex-1 mb-3" value={data.name || ""} disabled />
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
              <Toggle disabled={true} value={data.pmr === "true"} />
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-xs font-medium leading-4 text-gray-900">Adresse</div>

              <AddressForm
                readOnly={true}
                data={{
                  address: data.address,
                  zip: data.zip,
                  city: data.city,
                  department: data.department,
                  region: data.region,
                }}
                updateData={(newData) => setData({ ...data, ...newData })}
                query={query}
                setQuery={setQuery}
                options={results}
              />

              {data.address && (
                <>
                  <div className="flex items-center gap-3 mt-2">
                    <InputText name="depCenter" label="Département" className="flex-1" value={data.department} disabled />

                    <InputText name="regCenter" label="Région" className="flex-1" value={data.region} disabled />
                  </div>
                  <InputText name="academyCenter" label="Académie" className="flex-1 mb-3" value={"Académie de " + data.academy} disabled />
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
                  <InputText name="typologie" label="Typologie" className="flex-1 mb-2" value={data.typology} disabled />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <InputText name="domaine" label="Domaine" className="flex-1 mb-2" value={data.domain} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <InputText name="gestionnaire" label="Gestionnaire ou propriétaire" className="flex-1 mb-2" value={data.complement} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <InputText name="capacity" label="Capacité maximale d'accueil" className="flex-1 mb-4" value={data.placesTotal?.toString() || ""} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <InputText name="designation" label="Désignation du centre" className="flex-1 mb-2" value={data.centerDesignation || ""} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <InputText name="matricule" label="Matricule" className="flex-1 mb-2" value={data.matricule || ""} disabled />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
