import React, { useEffect, useState } from "react";
import { Col, DropdownItem, DropdownMenu, DropdownToggle, Label, Pagination, PaginationItem, PaginationLink, Row, UncontrolledDropdown } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";

import api from "../services/api";

import { translate, YOUNG_STATUS, YOUNG_PHASE, YOUNG_STATUS_COLORS } from "../utils";
import { toastr } from "react-redux-toastr";

import MailCorrection from "../scenes/inscription/MailCorrection";

export default ({ hit }) => {
  const STATUS = [YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.VALIDATED, YOUNG_STATUS.REFUSED];

  const [modal, setModal] = useState(false);
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
    if (status === YOUNG_STATUS.WAITING_CORRECTION) return setModal(true);
    setStatus(status);
  };

  const setStatus = async (status, note) => {
    try {
      young.historic.push({ phase: YOUNG_PHASE.INSCRIPTION, userName: `${user.firstName} ${user.lastName}`, userId: user._id, status, note });
      const { ok, code, data: newYoung } = await api.put(`/referent/young/${young._id}`, { historic: young.historic, status });

      if (status === YOUNG_STATUS.VALIDATED) {
        await api.post(`/referent/email/validate/${young._id}`, { subject: "Inscription validée" });
      }

      if (status === YOUNG_STATUS.REFUSED) {
        await api.post(`/referent/email/refuse/${young._id}`, { subject: "Inscription refusée" });
      }

      if (!ok) return toastr.error("Une erreur s'est produite :", code);
      setYoung(newYoung);
      toastr.success("Mis à jour!");
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue :", e.code);
    }
  };

  return (
    <>
      {modal && (
        <MailCorrection
          value={young}
          onChange={() => setModal(false)}
          onSend={(note) => {
            setStatus(YOUNG_STATUS.WAITING_CORRECTION, note);
            setModal(false);
          }}
        />
      )}
      <ActionBox color={YOUNG_STATUS_COLORS[young.status]}>
        <UncontrolledDropdown setActiveFromChild>
          <DropdownToggle tag="button">
            {translate(young.status)}
            <div className="down-icon">
              <svg viewBox="0 0 407.437 407.437">
                <polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 " />
              </svg>
            </div>
          </DropdownToggle>
          <DropdownMenu>
            {STATUS.map((status) => {
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
      padding: 5px 15px;
    }
  }
  button {
    background-color: #feb951;
    border: 1px solid #feb951;
    display: inline-flex;
    align-items: center;
    text-align: left;
    border-radius: 4px;
    padding: 0 0 0 12px;
    font-size: 12px;
    min-width: 130px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    outline: 0;
    .edit-icon {
      height: 17px;
      margin-right: 10px;
      path {
        fill: #fff;
      }
    }
    .down-icon {
      margin-left: auto;
      padding: 7px 15px;
      border-left: 2px solid #fbd392;
      margin-left: 15px;
      svg {
        height: 10px;
      }
      svg polygon {
        fill: #fff;
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
    :hover {
      background-color: #f3f3f3;
    }
  }

  ${({ color }) => `
    button {
      background-color: transparent;
      border: 1px solid ${color};
      color: ${color};
      .edit-icon {
        path {
          fill: ${color};
        }
      }
      .down-icon {
        border-left: 1px solid ${color};
        svg polygon {
          fill: ${color};
        }
      }
    }  
  `}
`;
