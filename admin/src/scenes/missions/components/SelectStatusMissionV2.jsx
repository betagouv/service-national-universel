import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import ModalConfirm from "../../../components/modals/ModalConfirm";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";
import api from "../../../services/api";
import { MISSION_STATUS, ROLES, translate } from "snu-lib";
import MailCorrectionMission from "./MailCorrectionMission";
import MailRefusedMission from "./MailRefusedMission";
import Select from "./Select";

export default function SelectStatusMissionV2({ hit, options = [], callback = () => {} }) {
  const [waitingCorrectionModal, setWaitingCorrectionModal] = useState(false);
  const [refusedModal, setRefusedModal] = useState(false);
  const [mission, setMission] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalConfirmWithMessage, setModalConfirmWithMessage] = useState({ isOpen: false, onConfirm: null });
  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    (async () => {
      const id = hit && hit._id;
      if (!id) return setMission(null);
      const { data } = await api.get(`/mission/${id}`);
      setMission(data);
    })();
  }, [hit._id]);

  if (user.role === ROLES.RESPONSIBLE || user.role === ROLES.SUPERVISOR)
    options.push(MISSION_STATUS.WAITING_VALIDATION, MISSION_STATUS.DRAFT, MISSION_STATUS.CANCEL, MISSION_STATUS.ARCHIVED);
  if (user.role === ROLES.ADMIN || user.role === ROLES.REFERENT_DEPARTMENT || user.role === ROLES.REFERENT_REGION) options = Object.keys(MISSION_STATUS);

  const onClickStatus = (status) => {
    if (status === MISSION_STATUS.CANCEL) {
      setModalConfirmWithMessage({
        isOpen: true,
        onConfirm: (statusComment) => onConfirmStatus(status, statusComment),
        title: `Annulation de la mission ${mission.name}`,
        message:
          "Veuillez préciser le motif d'annulation ci-dessous avant de confirmer l'action. Un email sera envoyé à tous les volontaires dont la candidature n'a pas été validée ou refusée pour les prévenir de cette annulation. Leur statut sera passé automatiquement en \"Annulée\". Cette action est irréversible.",
        placeholder: "Veuillez éditer ce message pour préciser le motif d'annulation...",
      });
    } else if (status === MISSION_STATUS.ARCHIVED) {
      setModalConfirmWithMessage({
        isOpen: true,
        onConfirm: (statusComment) => onConfirmStatus(status, statusComment),
        title: `Archivage de la mission ${mission.name}`,
        message:
          "Veuillez préciser le motif d'archivage ci-dessous avant de confirmer l'action. Un email sera envoyé à tous les volontaires dont la candidature n'a pas été validée ou refusée pour les prévenir de cet archivage. Leur statut sera passé automatiquement en \"Annulée\". Cette action est irréversible.",
        placeholder: "Veuillez éditer ce message pour préciser le motif d'archivage...",
      });
    } else {
      setModal({
        isOpen: true,
        onConfirm: () => onConfirmStatus(status),
        title: `Changement de statut de mission`,
        message: `Êtes-vous sûr(e) de vouloir modifier le statut de cette mission de "${translate(mission.status)}" à "${translate(status)}" ?`,
      });
    }
  };

  const onConfirmStatus = (status, statusComment = "") => {
    if (status === MISSION_STATUS.WAITING_CORRECTION && mission.tutorId) return setWaitingCorrectionModal(true);
    if (status === MISSION_STATUS.REFUSED && mission.tutorId) return setRefusedModal(true);
    setStatus(status, statusComment);
  };

  const setStatus = async (status, statusComment = "") => {
    try {
      const { ok, code, data: newMission } = await api.put(`/mission/${mission._id}`, { ...mission, status, statusComment });
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      setMission(newMission);
      toastr.success("Mis à jour!");
      callback(newMission);
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  };

  if (!mission)
    return (
      <div className={`flex w-full animate-pulse space-x-4`}>
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-3 gap-4 ">
            <div className="col-span-2 h-2 rounded bg-gray-300"></div>
            <div className="col-span-1 h-2 rounded bg-gray-300"></div>
          </div>
        </div>
      </div>
    );

  return (
    <>
      {waitingCorrectionModal && (
        <MailCorrectionMission
          value={mission}
          onChange={() => setWaitingCorrectionModal(false)}
          onSend={(note) => {
            setStatus(MISSION_STATUS.WAITING_CORRECTION, note);
            setWaitingCorrectionModal(false);
          }}
        />
      )}
      {refusedModal && (
        <MailRefusedMission
          value={mission}
          onChange={() => setRefusedModal(false)}
          onSend={(note) => {
            setStatus(MISSION_STATUS.REFUSED, note);
            setRefusedModal(false);
          }}
        />
      )}
      <Select
        selected={{ label: translate(mission.status), value: mission.status }}
        setSelected={(e) => onClickStatus(e.value)}
        options={options
          .filter((e) => e !== mission.status)
          .map((status) => {
            return { label: translate(status), value: status };
          })}
      />
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
      <ModalConfirmWithMessage
        isOpen={modalConfirmWithMessage.isOpen}
        title={modalConfirmWithMessage.title}
        message={modalConfirmWithMessage.message}
        placeholder={modalConfirmWithMessage.placeholder}
        onChange={() => setModalConfirmWithMessage({ isOpen: false, onConfirm: null })}
        onConfirm={(statusComment) => {
          modalConfirmWithMessage?.onConfirm(statusComment);
          setModalConfirmWithMessage({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
}
