import React, { useEffect, useState } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import api from "../services/api";
import { translate, MISSION_STATUS_COLORS, MISSION_STATUS, ROLES, colors } from "../utils";
import MailCorrectionMission from "../scenes/missions/components/MailCorrectionMission";
import MailRefusedMission from "../scenes/missions/components/MailRefusedMission";
import Chevron from "./Chevron";
import ModalConfirm from "./modals/ModalConfirm";
import ModalConfirmWithMessage from "./modals/ModalConfirmWithMessage";

export default ({ hit, options = [], callback = () => {} }) => {
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

  if (!mission) return <i style={{ color: colors.darkPurple }}>Chargement...</i>;

  if (user.role === ROLES.RESPONSIBLE || user.role === ROLES.SUPERVISOR)
    options.push(MISSION_STATUS.WAITING_VALIDATION, MISSION_STATUS.DRAFT, MISSION_STATUS.CANCEL, MISSION_STATUS.ARCHIVED);
  if (user.role === ROLES.ADMIN || user.role === ROLES.REFERENT_DEPARTMENT || user.role === ROLES.REFERENT_REGION) options = Object.keys(MISSION_STATUS);

  const onClickStatus = (status) => {
    if (status === MISSION_STATUS.CANCEL) {
      setModalConfirmWithMessage({
        isOpen: true,
        onConfirm: (statusComment) => onConfirmStatus(status, statusComment),
        title: `Annulation de la mission ${mission.name}`,
        message: "Veuillez précisez le motif d'annulation ci-dessous avant de valider. Un mail sera envoyé à tous les jeunes dont la candidature n'a pas été validée ou refusée.",
      });
    } else if (status === MISSION_STATUS.ARCHIVED) {
      setModalConfirmWithMessage({
        isOpen: true,
        onConfirm: (statusComment) => onConfirmStatus(status, statusComment),
        title: `Archivage de la mission ${mission.name}`,
        message:
          "Toutes les candidatures en attente de validation et en attente de vérification d'éligibilité seront automatiquement passées en : Annulée. Cette action est irréversible.",
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
      const { ok, code, data: newMission } = await api.put(`/mission/${mission._id}`, { status, statusComment });

      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      setMission(newMission);
      toastr.success("Mis à jour!");
      callback(newMission);
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  };

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
      <ActionBox color={MISSION_STATUS_COLORS[mission.status]}>
        <UncontrolledDropdown setActiveFromChild>
          <DropdownToggle tag="button">
            {translate(mission.status)}
            <Chevron color={MISSION_STATUS_COLORS[mission.status]} />
          </DropdownToggle>
          <DropdownMenu>
            {options
              .filter((e) => e !== mission.status)
              .map((status) => {
                return (
                  <DropdownItem key={status} className="dropdown-item" onClick={() => onClickStatus(status)}>
                    {translate(status)}
                  </DropdownItem>
                );
              })}
          </DropdownMenu>
        </UncontrolledDropdown>
        {/* <div>{JSON.stringify(young)}</div> */}
      </ActionBox>
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
};

const ActionBox = styled.div`
  .dropdown-menu {
    min-width: 0;
    a,
    div {
      white-space: nowrap;
      font-size: 14px;
      padding: 5px 15px;
    }
  }
  button {
    ${({ color }) => `
      background-color: ${color}15;
      border: 1px solid ${color};
      color: ${color};
    `}
    display: inline-flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    border-radius: 0.5rem;
    padding: 0 0 0 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    outline: 0;
    width: 100%;
    max-width: 250px;
    min-width: 250px;
    .edit-icon {
      height: 17px;
      margin-right: 10px;
      path {
        fill: ${({ color }) => `${color}`};
      }
    }
    .down-icon {
      margin-left: auto;
      padding: 7px 15px;
      margin-left: 15px;
      svg {
        height: 10px;
      }
      svg polygon {
        fill: ${({ color }) => `${color}`};
      }
    }
  }
  .dropdown-item {
    background-color: transparent;
    border: none;
    color: #767676;
    white-space: nowrap;
    font-size: 14px;
    padding: 5px 15px;
    font-weight: 400;
    width: 100%;
    :hover {
      background-color: #f3f3f3;
    }
  }
`;
