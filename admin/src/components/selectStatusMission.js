import React, { useEffect, useState } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import api from "../services/api";
import { translate, MISSION_STATUS_COLORS, MISSION_STATUS } from "../utils";
import MailCorrectionMission from "../scenes/missions/components/MailCorrectionMission";
import MailRefusedMission from "../scenes/missions/components/MailRefusedMission";
import Chevron from "./Chevron";

export default ({ hit, options = [] }) => {
  const [waitingCorrectionModal, setWaitingCorrectionModal] = useState(false);
  const [refusedModal, setRefusedModal] = useState(false);
  const [mission, setMission] = useState(hit);
  const user = useSelector((state) => state.Auth.user);

  if (!mission) return <i style={{ color: "#382F79" }}>Chargement...</i>;

  if (user.role === "responsible" || user.role === "supervisor")
    options.push(MISSION_STATUS.WAITING_VALIDATION, MISSION_STATUS.DRAFT, MISSION_STATUS.CANCEL, MISSION_STATUS.ARCHIVED);
  if (user.role === "admin" || user.role === "referent_department" || user.role === "referent_region") options = Object.keys(MISSION_STATUS);

  const handleClickStatus = (status) => {
    if (!confirm("Êtes-vous sûr(e) de vouloir modifier le statut de cette mission ?")) return;
    if (status === MISSION_STATUS.WAITING_CORRECTION && mission.tutor) return setWaitingCorrectionModal(true);
    if (status === MISSION_STATUS.REFUSED && mission.tutor) return setRefusedModal(true);
    setStatus(status);
  };

  const setStatus = async (status) => {
    try {
      const { ok, code, data: newMission } = await api.put(`/mission/${mission._id}`, { status });

      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      setMission(newMission);
      toastr.success("Mis à jour!");
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
            {options.map((status) => {
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
