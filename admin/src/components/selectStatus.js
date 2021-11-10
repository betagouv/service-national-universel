import React, { useEffect, useState } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";

import api from "../services/api";

import { translate, YOUNG_STATUS, YOUNG_PHASE, YOUNG_STATUS_COLORS, isEndOfInscriptionManagement2021, ROLES, colors, SENDINBLUE_TEMPLATES } from "../utils";
import { toastr } from "react-redux-toastr";

import ModalCorrection from "./modals/ModalCorrection";
import ModalRefused from "./modals/ModalRefused";
import ModalWithdrawn from "./modals/ModalWithdrawn";
import ModalGoal from "./modals/ModalGoal";
import Chevron from "./Chevron";
import ModalConfirm from "./modals/ModalConfirm";

export default ({ hit, options = Object.keys(YOUNG_STATUS), statusName = "status", phase = YOUNG_PHASE.INSCRIPTION, disabled, callback = () => { } }) => {
  const [modal, setModal] = useState(null);
  const [young, setYoung] = useState(null);
  const user = useSelector((state) => state.Auth.user);
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, onConfirm: null });

  const getInscriptions = async (department) => {
    const { data, ok, code } = await api.get(`/inscription-goal/${department}/current`);
    return data;
  };

  const getInscriptionGoalReachedNormalized = async (departement) => {
    const { data, ok, code } = await api.get("/inscription-goal");
    let max = 0;
    if (data) max = data.filter((d) => d.department === departement)[0]?.max;
    if (!ok) return toastr.error("Oups, une erreur s'est produite", translate(code));
    const nbYoungs = await getInscriptions(departement);
    return max > 0 && { ...nbYoungs, max };
  };

  useEffect(() => {
    (async () => {
      const id = hit && hit._id;
      if (!id) return setYoung(null);
      const { data } = await api.get(`/referent/young/${id}`);
      setYoung(data);
    })();
  }, [hit._id]);

  if (!young) return <i style={{ color: colors.darkPurple }}>Chargement...</i>;

  const handleClickStatus = async (status) => {
    setModalConfirm({
      isOpen: true,
      onConfirm: () => {
        if ([YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WITHDRAWN].includes(status)) return setModal(status);
        // if (status === YOUNG_STATUS.VALIDATED && phase === YOUNG_PHASE.INSCRIPTION) {
        //   const youngs = await getInscriptionGoalReachedNormalized(young.department);
        //   const ratioRegistered = youngs.registered / youngs.max;
        //   if (ratioRegistered >= 1) return setModal("goal");
        // }
        setStatus(status);
      },
      title: "Modification de statut",
      message: "Êtes-vous sûr(e) de vouloir modifier le statut de ce profil?\nUn email sera automatiquement envoyé à l'utlisateur.",
    });
  };

  const setStatus = async (status, note) => {
    const prevStatus = young.status;
    young.historic.push({ phase, userName: `${user.firstName} ${user.lastName}`, userId: user._id, status, note });
    young[statusName] = status;
    const now = new Date();
    young.lastStatusAt = now.toISOString();
    if (statusName === "statusPhase2") young.statusPhase2UpdatedAt = now.toISOString();
    if (status === "WITHDRAWN" && note) young.withdrawnMessage = note;
    if (status === "WAITING_CORRECTION" && note) young.inscriptionCorrectionMessage = note;
    if (status === "REFUSED" && note) young.inscriptionRefusedMessage = note;
    if (status === YOUNG_STATUS.VALIDATED && phase === YOUNG_PHASE.INTEREST_MISSION) young.phase = YOUNG_PHASE.CONTINUE;
    try {
      // we decided to let the validated youngs in the INSCRIPTION phase
      // referents use the export and need ALL the youngs of the current year
      // we'll pass every youngs currently in INSCRIPTION in COHESION_STAY once the campaign is done (~20 april 2021)

      // if (status === YOUNG_STATUS.VALIDATED && young.phase === YOUNG_PHASE.INSCRIPTION) {
      //   young.phase = YOUNG_PHASE.COHESION_STAY;
      // }

      const { lastStatusAt, statusPhase2UpdatedAt, withdrawnMessage, phase, inscriptionCorrectionMessage, inscriptionRefusedMessage } = young;

      const {
        ok,
        code,
        data: newYoung,
      } = await api.put(`/referent/young/${young._id}`, { [statusName]: young[statusName], lastStatusAt, statusPhase2UpdatedAt, withdrawnMessage, phase, inscriptionCorrectionMessage, inscriptionRefusedMessage });
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));

      if (status === YOUNG_STATUS.VALIDATED && phase === YOUNG_PHASE.INSCRIPTION) {
        if (prevStatus === "WITHDRAWN") await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_REACTIVATED}`);
        else await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_VALIDATED}`);
      }
      if (status === YOUNG_STATUS.WAITING_LIST) {
        // await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_LIST}`);
      }
      setYoung(newYoung);
      toastr.success("Mis à jour!");
      callback();
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  };

  return (
    <>
      <ModalConfirm
        isOpen={modalConfirm?.isOpen}
        title={modalConfirm?.title}
        message={modalConfirm?.message}
        onCancel={() => setModalConfirm({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modalConfirm?.onConfirm?.();
          setModalConfirm({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalCorrection
        isOpen={modal === YOUNG_STATUS.WAITING_CORRECTION}
        value={young}
        onChange={() => setModal(false)}
        onSend={(msg) => {
          setStatus(YOUNG_STATUS.WAITING_CORRECTION, msg);
          setModal(null);
        }}
      />
      <ModalRefused
        isOpen={modal === YOUNG_STATUS.REFUSED}
        value={young}
        onChange={() => setModal(false)}
        onSend={(msg) => {
          setStatus(YOUNG_STATUS.REFUSED, msg);
          setModal(null);
        }}
      />
      <ModalWithdrawn
        isOpen={modal === YOUNG_STATUS.WITHDRAWN}
        value={young}
        onChange={() => setModal(false)}
        onSend={(msg) => {
          setStatus(YOUNG_STATUS.WITHDRAWN, msg);
          setModal(null);
        }}
      />
      <ModalGoal
        isOpen={modal === "goal"}
        onChange={() => setModal(false)}
        onValidate={() => {
          setStatus(YOUNG_STATUS.VALIDATED);
          setModal(null);
        }}
        callback={() => {
          setStatus(YOUNG_STATUS.WAITING_LIST);
          setModal(null);
        }}
      />
      <ActionBox color={YOUNG_STATUS_COLORS[young[statusName]]}>
        <UncontrolledDropdown setActiveFromChild>
          <DropdownToggle tag="button" disabled={disabled}>
            {translate(young[statusName])}
            {!disabled && <Chevron color={YOUNG_STATUS_COLORS[young[statusName]]} />}
          </DropdownToggle>
          <DropdownMenu>
            {options
              .filter((e) => e !== young[statusName])
              .map((status) => {
                return (
                  <DropdownItem key={status} className="dropdown-item" onClick={() => handleClickStatus(status)}>
                    {translate(status)}
                  </DropdownItem>
                );
              })}
          </DropdownMenu>
        </UncontrolledDropdown>
        {/* <div>{JSON.stringify(young)}</div> */}
      </ActionBox>
    </>
  );
};

const ActionBox = styled.div`
  .dropdown-menu {
    max-width: 250px;
    min-width: 250px;
    a,
    div {
      white-space: nowrap;
      font-size: 14px;
      :hover {
        color: inherit;
      }
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
    min-height: 34px;
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
    border-radius: 0;
    background-color: transparent;
    border: none;
    color: #767676;
    white-space: nowrap;
    font-size: 14px;
    padding: 5px 15px;
    font-weight: 400;
    :hover {
      background-color: #f3f3f3;
    }
  }
`;
