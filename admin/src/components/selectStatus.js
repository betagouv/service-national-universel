import React, { useEffect, useState } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";

import api from "../services/api";

import { translate, YOUNG_STATUS, YOUNG_PHASE, YOUNG_STATUS_COLORS } from "../utils";
import { toastr } from "react-redux-toastr";
import matomo from "../services/matomo";

import ModalCorrection from "./modals/ModalCorrection";
import ModalRefused from "./modals/ModalRefused";
import ModalWithdrawn from "./modals/ModalWithdrawn";
import Chevron from "./Chevron";

export default ({ hit, options = Object.keys(YOUNG_STATUS), statusName = "status", phase = YOUNG_PHASE.INSCRIPTION }) => {
  const [modal, setModal] = useState(null);
  const [young, setYoung] = useState(null);
  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    (async () => {
      const id = hit && hit._id;
      if (!id) return setYoung(null);
      const { data } = await api.get(`/referent/young/${id}`);
      setYoung(data);
    })();
  }, [hit]);

  if (!young) return <div />;

  const handleClickStatus = (status) => {
    if (!confirm("Êtes-vous sûr(e) de vouloir modifier le statut de ce profil?\nUn email sera automatiquement envoyé à l'utlisateur.")) return;
    if ([YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WITHDRAWN].includes(status)) return setModal(status);
    setStatus(status);
  };

  const setStatus = async (status, note) => {
    const prevStatus = young.status;
    young.historic.push({ phase, userName: `${user.firstName} ${user.lastName}`, userId: user._id, status, note });
    young[statusName] = status;
    young.lastStatusAt = Date.now();
    if (status === "WITHDRAWN" && note) young.withdrawnMessage = note;
    if (status === YOUNG_STATUS.VALIDATED && phase === YOUNG_PHASE.INTEREST_MISSION) young.phase = YOUNG_PHASE.CONTINUE;
    try {
      // we decided to let the validated youngs in the INSCRIPTION phase
      // referents use the export and need ALL the youngs of the current year
      // we'll pass every youngs currently in INSCRIPTION in COHESION_STAY once the campaign is done (~20 april 2021)

      // if (status === YOUNG_STATUS.VALIDATED && young.phase === YOUNG_PHASE.INSCRIPTION) {
      //   young.phase = YOUNG_PHASE.COHESION_STAY;
      // }

      const { ok, code, data: newYoung } = await api.put(`/referent/young/${young._id}`, young);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));

      if (status === YOUNG_STATUS.VALIDATED && phase === YOUNG_PHASE.INSCRIPTION) {
        matomo.logEvent("status_update", YOUNG_STATUS.VALIDATED);
        window.lumiere("sendEvent", "status_update", YOUNG_STATUS.VALIDATED, { prevStatus, status: YOUNG_STATUS.VALIDATED }); // cat, action, props
        await api.post(`/referent/email/validate/${young._id}`, { subject: "Inscription validée", prevStatus });
      }
      if (status === YOUNG_STATUS.REFUSED) {
        matomo.logEvent("status_update", YOUNG_STATUS.REFUSED);
        window.lumiere("sendEvent", "status_update", YOUNG_STATUS.REFUSED, { prevStatus, status: YOUNG_STATUS.REFUSED }); // cat, action, props
      }
      setYoung(newYoung);
      toastr.success("Mis à jour!");
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  };

  return (
    <>
      {modal === YOUNG_STATUS.WAITING_CORRECTION && (
        <ModalCorrection
          value={young}
          onChange={() => setModal(false)}
          onSend={(msg) => {
            setStatus(YOUNG_STATUS.WAITING_CORRECTION, msg);
            setModal(null);
          }}
        />
      )}
      {modal === YOUNG_STATUS.REFUSED && (
        <ModalRefused
          value={young}
          onChange={() => setModal(false)}
          onSend={(msg) => {
            setStatus(YOUNG_STATUS.REFUSED, msg);
            setModal(null);
          }}
        />
      )}
      {modal === YOUNG_STATUS.WITHDRAWN && (
        <ModalWithdrawn
          value={young}
          onChange={() => setModal(false)}
          onSend={(msg) => {
            setStatus(YOUNG_STATUS.WITHDRAWN, msg);
            setModal(null);
          }}
        />
      )}
      <ActionBox color={YOUNG_STATUS_COLORS[young[statusName]]}>
        <UncontrolledDropdown setActiveFromChild>
          <DropdownToggle tag="button">
            {translate(young[statusName])}
            <Chevron color={YOUNG_STATUS_COLORS[young[statusName]]} />
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
    width: 200px;
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
