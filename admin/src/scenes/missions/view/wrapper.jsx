import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Spinner } from "reactstrap";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import api from "../../../services/api";
import SelectStatusMission from "../../../components/selectStatusMission";
import { translate, ROLES } from "snu-lib";
import Badge from "../../../components/Badge";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import ExclamationCircle from "../../../assets/icons/ExclamationCircle";

import Bin from "../../../assets/Bin";
import Duplicate from "../../../assets/Duplicate";
import Clock from "../../../assets/Clock";

export default function Wrapper({ mission, tab, children, getMission }) {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const onClickDelete = () => {
    setModal({ isOpen: true, onConfirm: onConfirmDelete, title: "Êtes-vous sûr(e) de vouloir supprimer cette mission ?", message: "Cette action est irréversible." });
  };

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.remove(`/mission/${mission._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok && code === "LINKED_OBJECT")
        return toastr.error("Vous ne pouvez pas supprimer cette mission car des candidatures sont encore liées à cette mission.", { timeOut: 5000 });
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Cette mission a été supprimée.");
      return history.push(`/mission`);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression de la mission :", translate(e.code));
    }
  };

  const onClickDuplicate = () => {
    setModal({ isOpen: true, onConfirm: onConfirmDuplicate, title: "Êtes-vous sûr(e) de vouloir dupliquer cette mission ?" });
  };

  const onConfirmDuplicate = async () => {
    return history.push(`/mission/create/${mission.structureId}?duplicate=${mission._id}`);
  };

  if (!mission || !user) return null;
  return (
    <div style={{ flex: tab === "missions" ? "0%" : 2, position: "relative" }}>
      <div className=" my-7 flex flex-row flex-wrap-reverse justify-between gap-4 border-b border-gray-200 px-8">
        <div className="flex flex-col justify-end">
          <div className="mb-7 text-2xl font-bold ">
            {mission.name} {mission.isMilitaryPreparation === "true" ? <Badge text="Préparation Militaire" /> : null}
          </div>
          <div className="flex flex-row gap-8">
            <div
              className={`cursor-pointer text-sm text-gray-400 ${tab === "details" && "border-b-2 border-blue-600 pb-4 text-blue-600"}`}
              onClick={() => history.push(`/mission/${mission._id}`)}>
              Détails
            </div>
            <div
              className={`flex cursor-pointer flex-row items-center gap-2 pb-4 text-sm text-gray-400 ${tab === "youngs" && "border-b-2 border-blue-600 text-blue-600"}`}
              onClick={() => history.push(`/mission/${mission._id}/youngs/all`)}>
              {mission.pendingApplications > 0 && mission.pendingApplications >= mission.placesLeft * 5 ? (
                <ExclamationCircle className="text-white" fill="red" />
              ) : mission.pendingApplications > 0 ? (
                <ExclamationCircle className="text-white" fill="orange" />
              ) : null}
              <div>Candidatures</div>
            </div>

            {[ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) ? (
              mission.visibility === "HIDDEN" || (mission.pendingApplications > 0 && mission.pendingApplications >= mission.placesLeft * 5) || mission.placesLeft < 1 ? (
                <div className={`cursor-not-allowed text-sm text-gray-400 ${tab === "propose-mission" && "border-b-2 border-blue-600 pb-4 text-blue-600"}`} disabled>
                  Proposer cette mission
                </div>
              ) : (
                <div
                  className={`cursor-pointer text-sm text-gray-400 ${tab === "propose-mission" && "border-b-2 border-blue-600 pb-4 text-blue-600"}`}
                  onClick={() => history.push(`/mission/${mission._id}/propose-mission`)}>
                  Proposer cette mission
                </div>
              )
            ) : null}
            {[ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) ? (
              <div
                className={`cursor-pointer text-sm text-gray-400 ${tab === "historique" && "border-b-2 border-blue-600 pb-4 text-blue-600"}`}
                onClick={() => history.push(`/mission/${mission._id}/historique`)}>
                <div className="flex flex-row items-center justify-center gap-2">
                  <Clock fill={tab === "historique" ? "#2563EB" : "#6B7280"} />
                  Historique
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex flex-row items-center justify-center gap-4">
          <div className="flex flex-col text-right">
            <div className="text-3xl font-bold">{mission.placesLeft}</div>
            <div className="text-xs uppercase text-gray-500">
              {mission.placesLeft > 1 ? (
                <>
                  <div>places</div>
                  <div>restantes</div>
                </>
              ) : (
                <>
                  <div>place</div>
                  <div>restante</div>
                </>
              )}
            </div>
            <div className="flex flex-row justify-end">
              <div className="text-gray-500">sur</div>
              <div>&nbsp;{mission.placesTotal}</div>
            </div>
          </div>
          <div className="flex flex-col">
            <SelectStatusMission hit={mission} callback={getMission} />
            <div className="my-[15px] flex items-center justify-between">
              <Button icon={<Bin fill="red" />} onClick={onClickDelete}>
                Supprimer
              </Button>
              <Button icon={<Duplicate fill="#6B7280" />} className="ml-[8px]" onClick={onClickDuplicate}>
                Dupliquer
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-8">{children}</div>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </div>
  );
}
function Button({ children, className = "", onClick = () => {}, spinner = false, icon, href, target, rel }) {
  if (href) {
    return (
      <a
        className={`inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-[6px] border-[1px] border-solid border-[transparent] bg-[#FFFFFF] px-3 py-2 text-[#1F2937] hover:border-[#D1D5DB] ${className}`}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}>
        {icon && <icon.type {...icon.props} className={`mr-[8px] ${icon.props.className}`} />}
        {children}
      </a>
    );
  } else {
    return (
      <button
        className={`flex cursor-pointer items-center justify-center whitespace-nowrap rounded-[6px] border-[1px] border-solid border-[transparent] bg-[#FFFFFF] px-3 py-2 text-[#1F2937] hover:border-[#D1D5DB] ${className}`}
        onClick={onClick}>
        {spinner && <Spinner size="sm" style={{ borderWidth: "0.1em", marginRight: "0.5rem" }} />}
        {icon && <icon.type {...icon.props} className={`mr-[8px] ${icon.props.className}`} />}
        {children}
      </button>
    );
  }
}
