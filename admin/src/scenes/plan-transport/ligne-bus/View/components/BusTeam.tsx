import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import validator from "validator";
import { HiOutlineExclamation } from "react-icons/hi";

import { canEditLigneBusTeam, isBusEditionOpen, isTeamLeaderOrSupervisorEditable, translate } from "snu-lib";
import { CohortDto, LigneBusDto } from "snu-lib/src/dto";
import { ModalConfirmation } from "@snu/ds/admin";

import Bin from "@/assets/Bin";
import Pencil from "@/assets/icons/Pencil";
import Toggle from "@/components/Toggle";
import { capture } from "@/sentry";
import api from "@/services/api";

import { mapBusTeamViewToDto } from "@/scenes/plan-transport/ligne-bus/View/LigneDeBusMapper";
import DatePickerList from "../../components/DatePickerList";
import Field from "../../components/Field";

type BusTeamProps = {
  bus: LigneBusDto;
  onBusChange: (bus: BusTeamProps["bus"]) => void;
  title: string;
  role: string;
  addOpen: boolean;
  onAddOpenChange?: (value?: boolean) => void;
  idTeam: string;
  cohort: CohortDto;
};

export type BusTeamView = {
  back: boolean;
  birthdate?: Date;
  firstname?: string;
  forth: boolean;
  idTeam?: string;
  lastname?: string;
  mail?: string;
  phone?: string;
  role: string;
};

export default function BusTeam({ bus, onBusChange, title, role, addOpen, onAddOpenChange, idTeam, cohort }: BusTeamProps) {
  const user = useSelector((state: any) => state.Auth.user);

  const [editInfo, setEditInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMergedLineConfirmation, setShowMergedLineConfirmation] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [data, setData] = useState<BusTeamView>({
    idTeam: "create",
    role: role,
    forth: false,
    back: false,
  });

  React.useEffect(() => {
    if (!idTeam && onAddOpenChange) setEditInfo(true);
    if (idTeam) {
      const member = bus.team.filter((item) => item._id === idTeam);
      setData({
        role: role,
        idTeam: member[0]._id,
        firstname: member[0].firstName,
        lastname: member[0].lastName,
        birthdate: member[0].birthdate,
        mail: member[0].mail,
        phone: member[0].phone,
        forth: member[0].forth,
        back: member[0].back,
      });
    }
    setErrors({});
  }, [editInfo]);

  const handleSubmitInfo = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      const errors: any = {};

      const errorEmail = "Adresse email invalide";
      const errorPhone = "Numéro de téléphone invalide";

      if (data.mail && !validator.isEmail(data.mail)) {
        errors.mail = errorEmail;
      }

      if (data.phone && !validator.isMobilePhone(data.phone)) {
        errors.phone = errorPhone;
      }

      if (!data.firstname) errors.firstname = "Ce champ est obligatoire";
      if (!data.lastname) errors.lastname = "Ce champ est obligatoire";
      if (!data.birthdate) errors.birthdate = "Ce champ est obligatoire";
      if (!data.mail) errors.mail = "Ce champ est obligatoire";
      if (!data.phone) errors.phone = "Ce champ est obligatoire";
      if (data.forth === false && data.back === false) errors.travel = "Vous devez valider un aller et/ou un retour";

      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        setIsLoading(false);
        return;
      }

      if (bus.mergedBusIds?.length && !showMergedLineConfirmation) {
        setIsLoading(false);
        return setShowMergedLineConfirmation(true);
      }

      const busTeamDto = mapBusTeamViewToDto(data);
      //Save data
      const { ok, code, data: ligneInfo } = await api.put(`/ligne-de-bus/${bus._id}/team`, busTeamDto);

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la modification de la ligne", translate(code));
        return setIsLoading(false);
      }
      onBusChange(ligneInfo);
      setEditInfo(false);
      setIsLoading(false);
      setShowMergedLineConfirmation(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la modification de la ligne", "");
      setIsLoading(false);
    }
  };

  const DeleteInfo = async () => {
    if (data.idTeam === "create" && onAddOpenChange) return onAddOpenChange(false);
    if (data.idTeam === "create") {
      return setEditInfo(false);
    }
    try {
      setIsLoading(true);
      //delete data
      const busTeamDto = mapBusTeamViewToDto(data);
      const { ok, code, data: ligneInfo } = await api.put(`/ligne-de-bus/${bus._id}/teamDelete`, busTeamDto);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la suppression", translate(code));
        return setIsLoading(false);
      }
      onBusChange(ligneInfo);
      setEditInfo(false);
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la suppression", "");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full rounded-xl bg-white p-8">
      <div className="flex items-center justify-between">
        <div className="text-lg leading-7 text-gray-900 font-bold">{title}</div>
        {canEditLigneBusTeam(user) || isBusEditionOpen(user, cohort) || isTeamLeaderOrSupervisorEditable(user, cohort) ? (
          <>
            {!editInfo ? (
              <>
                {role === "supervisor" && bus.team.filter((item) => item.role === "supervisor").length && bus.team.length < 11 && !addOpen ? (
                  <button className="flex text-blue-600 mr-[44rem] mt-1 cursor-pointer text-sm hover:underline" onClick={() => onAddOpenChange?.(true)}>
                    + Ajouter un encadrant
                  </button>
                ) : null}
                <button
                  className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setEditInfo(true)}
                  disabled={isLoading}>
                  <Pencil stroke="#2563EB" className="h-[12px] w-[12px]" />
                  Modifier
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {role === "supervisor" ? (
                  <button
                    className="flex cursor-pointer items-center gap-2 rounded-full text-red-600 border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs leading-5 hover:border-red-600"
                    onClick={DeleteInfo}
                    disabled={isLoading}>
                    <Bin /> Supprimer
                  </button>
                ) : null}
                {addOpen === false ? (
                  <button
                    className="flex cursor-pointer items-center gap-2 rounded-full border-[1px] border-gray-100 bg-gray-100 px-3 py-2 text-xs leading-5 text-gray-700 hover:border-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => setEditInfo(false)}
                    disabled={isLoading}>
                    Annuler
                  </button>
                ) : null}
                <button
                  className="flex cursor-pointer items-center gap-2 rounded-full  border-[1px] border-blue-100 bg-blue-100 px-3 py-2 text-xs leading-5 text-blue-600 hover:border-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
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
      <div className="my-8 flex">
        <div className="flex w-[45%] flex-col justify-between gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {/*@ts-expect-error jsx type*/}
              <Field label="Nom" onChange={(e) => setData({ ...data, lastname: e.target.value })} value={data.lastname} error={errors?.lastname} readOnly={!editInfo} />
              {/*@ts-expect-error jsx type*/}
              <Field label="Prénom" onChange={(e) => setData({ ...data, firstname: e.target.value })} value={data.firstname} error={errors?.firstname} readOnly={!editInfo} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <DatePickerList
                label="Date de naissance"
                onChange={(e) => setData({ ...data, birthdate: e })}
                value={data.birthdate ? new Date(data.birthdate) : null}
                error={errors?.birthdate}
                readOnly={!editInfo}
              />
              {/*@ts-expect-error jsx type*/}
              <Field label="Téléphone" onChange={(e) => setData({ ...data, phone: e.target.value })} value={data.phone} error={errors?.phone} readOnly={!editInfo} />
            </div>
            {/*@ts-expect-error jsx type*/}
            <Field label="Email" onChange={(e) => setData({ ...data, mail: e.target.value })} value={data.mail} error={errors?.mail} readOnly={!editInfo} />
          </div>
        </div>
        <div className="flex w-[10%] items-center justify-center">
          <div className="my-2 h-full w-[1px] border-r-[1px] border-gray-300"></div>
        </div>
        <div className="flex w-[45%] flex-col gap-4 ">
          {/*@ts-expect-error jsx type*/}
          <Field label="Numéro de ligne" value={bus.busId} readOnly={true} />
          <div className="flex items-center gap-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-800 justify-between">
            <div className="font-medium text-gray-800">Concerné par l'aller : </div>
            <Toggle
              disabled={!editInfo}
              value={data?.forth === true}
              onChange={(e) => {
                setData({ ...data, forth: e });
              }}
            />
          </div>
          <div className="flex items-center gap-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-800 justify-between">
            <div className="font-medium text-gray-800">Concerné par le retour : </div>
            <Toggle
              disabled={!editInfo}
              value={data?.back === true}
              onChange={(e) => {
                setData({ ...data, back: e });
              }}
            />
          </div>
          {errors?.travel && <div className="text-[#EF4444]">{errors?.travel}</div>}
        </div>
      </div>
      {showMergedLineConfirmation && (
        <ModalConfirmation
          isOpen={showMergedLineConfirmation}
          onClose={() => setShowMergedLineConfirmation(false)}
          icon={<HiOutlineExclamation size={48} className="text-gray-300" />}
          title="Modifier un chef de file / encadrant"
          text={
            <p>
              Attention vous souhaitez modifier le chef de file / encadrant Prénom Nom.
              <br />
              Ces modifications seront automatiquement répercutées sur toutes les autres lignes fusionnées concernées.
            </p>
          }
          actions={[
            { title: "Fermer", isCancel: true, onClick: () => setShowMergedLineConfirmation(false) },
            { title: "Confirmer", onClick: handleSubmitInfo },
          ]}
        />
      )}
    </div>
  );
}
