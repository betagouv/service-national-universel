import React, { useEffect, useState } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";

import api from "../services/api";
import { translate, MISSION_STATUS_COLORS, MISSION_STATUS } from "../utils";
import MailCorrectionMission from "../scenes/missions/components/MailCorrectionMission";
import MailRefusedMission from "../scenes/missions/components/MailRefusedMission";

export default ({ hit }) => {
  const [waitingCorrectionModal, setWaitingCorrectionModal] = useState(false);
  const [refusedModal, setRefusedModal] = useState(false);
  const [mission, setMission] = useState(hit);

  useEffect(() => {
    (async () => {
      const id = hit && hit._id;
      if (!id) return setMission(null);
      const { data } = await api.get(`/mission/${id}`);
      setMission(data);
    })();
  }, [hit]);

  if (!mission) return <div />;

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
            <div className="down-icon">
              <svg viewBox="0 0 407.437 407.437">
                <polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 " />
              </svg>
            </div>
          </DropdownToggle>
          <DropdownMenu>
            {Object.keys(MISSION_STATUS).map((status) => {
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
    /* width: 400px; */
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
    max-width: 300px;
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
      /* border-left: 1px solid ${({ color }) => `${color}`}; */
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
