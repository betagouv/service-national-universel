import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { BiHandicap } from "react-icons/bi";
import { Title } from "../components/commons";
import { getDepartmentNumber, canCreateOrUpdateCohesionCenter, ROLES } from "../../../utils";
import { canDeleteMeetingPoint, canDeleteMeetingPointSession, canUpdateMeetingPoint, START_DATE_SESSION_PHASE1 } from "snu-lib";
import Pencil from "../../../assets/icons/Pencil";
import VerifyAddress from "../../phase0/components/VerifyAddress";
import ModalRattacherCentre from "../components/ModalRattacherCentre";

import Field from "../components/Field";

import { Box } from "../../../components/box";
import PanelActionButton from "../../../components/buttons/PanelActionButton";

export default function Details({ data, setData }) {
  const user = useSelector((state) => state.Auth.user);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDelete, setModalDelete] = useState({ isOpen: false });
  const [isLoading, setIsLoading] = useState(false);
  const [editInfo, setEditInfo] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const onDelete = () => {};
  const onSubmitInfo = () => {};
  const onVerifyAddress = () => {};
  return (
    <div className="flex flex-col m-8 gap-6">
      {/*TODO : SET Centre par défaut + cohorte disponible ?*/}
      <ModalRattacherCentre isOpen={modalVisible} onCancel={() => setModalVisible(false)} user={user} />

      <div className="flex items-center justify-between">
        <Title>{data.name}</Title>
        <div className="flex items-center gap-2">
          {canDeleteMeetingPoint(user) ? (
            <button
              className="border-[1px] border-red-600 bg-red-600 shadow-sm px-4 py-2 text-white hover:!text-red-600 hover:bg-white transition duration-300 ease-in-out rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() =>
                setModalDelete({
                  isOpen: true,
                  title: "Supprimer le point de rassemblement",
                  message: "Êtes-vous sûr de vouloir supprimer ce point de rassemblement ?",
                  onDelete: onDelete,
                })
              }
              disabled={isLoading}>
              Supprimer
            </button>
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
                    onClick={() => setEditInfo(false)}
                    disabled={isLoading}>
                    Annuler
                  </button>
                  <button
                    className="flex items-center gap-2 rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-2 border-[1px] border-blue-100 text-blue-600 bg-blue-100 hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onSubmitInfo}
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
              <div className="text-xs font-medium leading-4 text-gray-900">Nom</div>
              <Field label={"Nom du centre"} onChange={(e) => setData({ ...data, name: e.target.value })} value={data.name} error={errors?.name} readOnly={!editInfo} />
            </div>
          </div>
          <div className="flex w-[10%] justify-center items-center">
            <div className="w-[1px] h-4/5 border-r-[1px] border-gray-300"></div>
          </div>
          <div className="flex flex-col w-[45%]  justify-between">
            <div className="flex flex-col gap-3">
              <div className="text-xs font-medium leading-4 text-gray-900">Adresse</div>
              <Field
                label={"Adresse"}
                onChange={(e) => setData({ ...data, address: e.target.value, addressVerified: false })}
                value={data.address}
                error={errors?.address}
                readOnly={!editInfo}
              />
              <div className="flex items-center gap-3">
                <Field
                  label="Code postal"
                  onChange={(e) => setData({ ...data, zip: e.target.value, addressVerified: false })}
                  value={data.zip}
                  error={errors?.zip}
                  readOnly={!editInfo}
                />
                <Field
                  label="Ville"
                  onChange={(e) => setData({ ...data, city: e.target.value, addressVerified: false })}
                  value={data.city}
                  error={errors?.city}
                  readOnly={!editInfo}
                />
              </div>
              <div className="flex items-center gap-3">
                <Field label="Département" onChange={(e) => setData({ ...data, department: e.target.value })} value={data.department} readOnly={true} disabled={editInfo} />
                <Field label="Région" onChange={(e) => setData({ ...data, region: e.target.value })} value={data.region} readOnly={true} disabled={editInfo} />
              </div>
              {editInfo ? (
                <div className="flex flex-col gap-2">
                  <VerifyAddress
                    address={data.address}
                    zip={data.zip}
                    city={data.city}
                    onSuccess={onVerifyAddress(true)}
                    onFail={onVerifyAddress()}
                    isVerified={data.addressVerified === true}
                    buttonClassName="border-[#1D4ED8] text-[#1D4ED8]"
                    verifyText="Pour vérifier  l'adresse vous devez remplir les champs adresse, code postal et ville."
                  />
                  {errors?.addressVerified && <div className="text-[#EF4444]">{errors.addressVerified}</div>}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "2rem 3rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <h4 style={{ marginBottom: "2rem" }}>{center.name}</h4>
        {canCreateOrUpdateCohesionCenter(user) ? (
          <div style={{ flexBasis: "0" }}>
            <Link to={`/centre/${center._id}/edit`}>
              <PanelActionButton title="Modifier" icon="pencil" style={{ margin: 0 }} />
            </Link>
          </div>
        ) : null}
      </div>
      <div className="flex w-2/5">
        <Box>
          <div className="p-9">
            <div className="flex justify-between ">
              <h4>
                <strong>Informations du centre</strong>
              </h4>
              {center.pmr === "true" ? (
                <div className="flex bg-[#14B8A6] rounded-full px-3 py-1 items-center text-[#F0FDFA] text-md gap-1">
                  <BiHandicap size={20} />
                  <div>Accessible&nbsp;PMR</div>
                </div>
              ) : null}
            </div>
            <div>
              {user.role === ROLES.ADMIN ? <Donnee title={"Code 2022 (modérateur)"} value={center.code2022} number={""} /> : null}
              <Donnee title={"Région"} value={center.region} number={""} />
              <Donnee title={"Département"} value={center.department} number={`(${getDepartmentNumber(center.department)})`} />
              <Donnee title={"Ville"} value={center.city} number={`(${center.zip})`} />
              <Donnee title={"Adresse"} value={center.address} number={""} />
            </div>
          </div>
        </Box>
      </div>
    </div>
  );
}

const Donnee = ({ title, value, number }) => {
  return (
    <div className="flex pt-4">
      <div className="w-1/2 text-brand-detail_title "> {title} : </div>
      <div className="w-1/2 font-medium">
        {value} {number}
      </div>
    </div>
  );
};
