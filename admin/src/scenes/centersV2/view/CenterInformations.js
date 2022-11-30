import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { BiHandicap } from "react-icons/bi";
import { Title } from "../components/commons";
import { canCreateOrUpdateCohesionCenter, ROLES } from "../../../utils";
import { canUpdateMeetingPoint, departmentToAcademy } from "snu-lib";
import Pencil from "../../../assets/icons/Pencil";
import VerifyAddress from "../../phase0/components/VerifyAddress";
import ModalRattacherCentre from "../components/ModalRattacherCentre";
import ModalConfirmDelete from "../components/ModalConfirmDelete";
import ReactTooltip from "react-tooltip";
import { useHistory } from "react-router-dom";

import api from "../../../services/api";

import Field from "../components/Field";
import Toggle from "../components/Toggle";
import Select from "../components/Select";

import { toastr } from "react-redux-toastr";
import { capture } from "../../../sentry";

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

export default function Details({ center, setCenter, sessions }) {
  const history = useHistory();

  const user = useSelector((state) => state.Auth.user);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDelete, setModalDelete] = React.useState({ isOpen: false });

  const [isLoading, setIsLoading] = useState(false);
  const [editInfo, setEditInfo] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [data, setData] = useState(null);
  useEffect(() => {
    setData(center);
  }, [center]);

  const onVerifyAddress = (isConfirmed) => (suggestion) => {
    setData({
      ...data,
      addressVerified: true,
      region: suggestion.region,
      department: suggestion.department,
      location: suggestion.location,
      address: isConfirmed ? suggestion.address : data.address,
      zip: isConfirmed ? suggestion.zip : data.zip,
      city: isConfirmed ? suggestion.city : data.city,
      academy: departmentToAcademy[suggestion.department],
    });
  };
  const onSubmit = async () => {
    try {
      setIsLoading(true);
      const error = {};
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
      if (!data?.addressVerified) {
        error.addressVerified = "L'adresse n'a pas été vérifiée";
      }
      if (!data?.placesTotal || isNaN(data?.placesTotal)) {
        error.placesTotal = "Le nombre de places est incorrect";
      }
      if (!data?.centerDesignation) {
        error.centerDesignation = "La désigniation est obligatoire";
      }
      if (!data?.code2022) {
        error.code2022 = "Le code est obligatoire";
      }
      // check session
      const canUpdateSession = sessions.filter((s) => s.placesTotal > data.placesTotal).length === 0;
      if (!canUpdateSession) {
        error.placesTotal = "La capacité maximale est inférieur à la capacité de l'une des sessions";
      }
      setErrors(error);
      if (Object.keys(error).length > 0) return setIsLoading(false);
      const { ok, code, data: returnedData } = await api.put(`/cohesion-center/${center._id}`, data);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la modification du centre", code);
        return setIsLoading(false);
      }
      setIsLoading(false);
      setErrors({});
      setCenter(returnedData);
      setEditInfo(false);
      toastr.success("Le centre a été modifié avec succès");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modification du centre.");
      setIsLoading(false);
    }
  };
  const onDelete = async () => {
    try {
      setIsLoading(true);
      const { ok, code } = await api.remove(`/cohesion-center/${data._id}`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la suppression du centre", code);
        return setIsLoading(false);
      }
      toastr.success("Le centre a bien été supprimé");
      history.push("/centre");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la suppression du centre");
      setIsLoading(false);
    }
  };
  if (!data) return <></>;
  return (
    <div className="flex flex-col m-8 gap-6">
      {/*TODO : SET Centre par défaut + cohorte disponible ?*/}
      <ModalRattacherCentre editable={false} defaultCentre={center} isOpen={modalVisible} onCancel={() => setModalVisible(false)} user={user} />
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
      <div className="flex items-center justify-between">
        <Title>{data.name}</Title>
        <div className="flex items-center gap-2">
          {user.role === ROLES.ADMIN ? (
            <div data-tip="" data-for="tooltip-delete">
              {sessions.length !== 0 && (
                <ReactTooltip id="tooltip-delete" className="bg-white shadow-xl text-black" arrowColor="white" disable={false}>
                  <div className="text-[black]">Des sessions sont encore associées au centre</div>
                </ReactTooltip>
              )}

              <button
                className="border-[1px] border-red-600 bg-red-600 shadow-sm px-4 py-2 text-white hover:!text-red-600 hover:bg-white transition duration-300 ease-in-out rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="border-[1px] border-blue-600 bg-blue-600 shadow-sm px-4 py-2 text-white hover:!text-blue-600 hover:bg-white transition duration-300 ease-in-out rounded-lg"
              onClick={() => setModalVisible(true)}>
              Rattacher un centre à un séjour
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col rounded-lg pt-8 pb-12 px-8 bg-white gap-8">
        <div className="flex items-center justify-between">
          <div className="text-lg leading-6 font-medium text-gray-900">Informations générales</div>
          {canUpdateMeetingPoint(user) ? (
            <>
              {!editInfo ? (
                <button
                  className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setEditInfo(true)}
                  disabled={isLoading}>
                  <Pencil stroke="#2563EB" className="w-[12px] h-[12px]" />
                  Modifier
                </button>
              ) : (
                <div className="flex itmes-center gap-2">
                  <button
                    className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-gray-100 text-gray-700 bg-gray-100 hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      setEditInfo(false);
                      setData(center);
                      setErrors({});
                    }}
                    disabled={isLoading}>
                    Annuler
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onSubmit}
                    disabled={isLoading}>
                    <Pencil stroke="#2563EB" className="w-[12px] h-[12px] mr-[6px]" />
                    Enregistrer les changements
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
        <div className="flex">
          <div className="flex flex-col w-[45%] gap-4 ">
            <div className="flex flex-col gap-2">
              <div className="text-xs font-medium leading-4 text-gray-900">Nom du centre</div>
              <Field readOnly={!editInfo} label="Nom du centre" onChange={(e) => setData({ ...data, name: e.target.value })} value={data.name} error={errors?.name} />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <div className="flex bg-gray-100 rounded-full items-center justify-center p-2 ">
                  <BiHandicap className="text-gray-500 h-5 w-5" />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="text-sm leading-5 font-bold text-gray-700">Accessibilité PMR</div>
                  <div className="text-sm leading-5 text-gray-700">{data.pmr ? "Oui" : "Non"}</div>
                </div>
              </div>
              <Toggle disabled={!editInfo} value={data.pmr === "true"} onChange={(e) => setData({ ...data, pmr: e.toString() })} />
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-xs font-medium leading-4 text-gray-900">Adresse</div>

              <Field
                readOnly={!editInfo}
                label="Adresse"
                onChange={(e) => setData({ ...data, address: e.target.value, addressVerified: false })}
                value={data.address}
                error={errors?.address}
              />
              <div className="flex items-center gap-3">
                <Field
                  readOnly={!editInfo}
                  label="Code postal"
                  onChange={(e) => setData({ ...data, zip: e.target.value, addressVerified: false })}
                  value={data.zip}
                  error={errors?.zip}
                />
                <Field
                  readOnly={!editInfo}
                  label="Ville"
                  onChange={(e) => setData({ ...data, city: e.target.value, addressVerified: false })}
                  value={data.city}
                  error={errors?.city}
                />
              </div>
              {data.addressVerified && (
                <>
                  <div className="flex items-center gap-3">
                    <Field readOnly={!editInfo} label="Département" onChange={(e) => setData({ ...data, department: e.target.value })} value={data.department} disabled={true} />
                    <Field readOnly={!editInfo} label="Région" onChange={(e) => setData({ ...data, region: e.target.value })} value={data.region} disabled={true} />
                  </div>
                  <Field
                    readOnly={!editInfo}
                    label="Académie"
                    onChange={(e) => setData({ ...data, academy: e.target.value })}
                    value={"Académie de " + data.academy}
                    disabled={true}
                  />
                </>
              )}
              {editInfo && (
                <div className="flex flex-col gap-2 ">
                  <VerifyAddress
                    address={data.address}
                    zip={data.zip}
                    city={data.city}
                    onSuccess={onVerifyAddress(true)}
                    onFail={onVerifyAddress()}
                    isVerified={data.addressVerified === true}
                    buttonClassName="border-[#1D4ED8] text-[#1D4ED8]"
                    verifyText="Pour vérifier l'adresse vous devez remplir les champs adresse, code postal et ville."
                    verifyButtonText="Vérifier l'adresse du centre"
                  />
                  {errors?.addressVerified && <div className="text-[#EF4444]">{errors.addressVerified}</div>}
                </div>
              )}
            </div>
          </div>
          <div className="flex w-[10%] justify-center items-center">
            <div className="w-[1px] h-4/5 border-r-[1px] border-gray-300"></div>
          </div>
          <div className="flex flex-col w-[45%]  justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium text-gray-900">Détails</div>
                <div className="flex flex-col gap-2">
                  <Select
                    label="Typologie"
                    readOnly={!editInfo}
                    options={optionsTypology}
                    selected={optionsTypology.find((e) => e.value === data.typology)}
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
                />
              </div>
              <div className="flex flex-col gap-2">
                <Field
                  readOnly={!editInfo}
                  label="Précisez le gestionnaire ou propriétaire"
                  onChange={(e) => setData({ ...data, complement: e.target.value })}
                  value={data.complement}
                  error={errors?.complement}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Field
                  readOnly={!editInfo}
                  label="Capacité maximale d'accueil"
                  onChange={(e) => setData({ ...data, placesTotal: e.target.value })}
                  value={data.placesTotal}
                  error={errors?.placesTotal}
                />
              </div>
              {user.role === ROLES.ADMIN && (
                <>
                  <div className="flex flex-col gap-2">
                    <Field
                      readOnly={!editInfo}
                      label="Désignation du centre"
                      onChange={(e) => setData({ ...data, centerDesignation: e.target.value })}
                      value={data.centerDesignation}
                      error={errors?.centerDesignation}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Field
                      readOnly={!editInfo}
                      label="Code du centre"
                      onChange={(e) => setData({ ...data, code2022: e.target.value })}
                      value={data.code2022}
                      error={errors?.code2022}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
