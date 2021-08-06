import React, { useEffect, useState } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";

import api from "../services/api";

import { translate, APPLICATION_STATUS_COLORS, APPLICATION_STATUS, ROLES, colors } from "../utils";
import { toastr } from "react-redux-toastr";
import Chevron from "./Chevron";
import ModalConfirmWithMessage from "./modals/ModalConfirmWithMessage";
import ModalConfirm from "./modals/ModalConfirm";

export default ({ hit, options = [], callback }) => {
  const [application, setApplication] = useState(null);
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, onConfirm: null });
  const [modalRefuse, setModalRefuse] = useState({ isOpen: false, onConfirm: null });

  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    (async () => {
      const id = hit && hit._id;
      if (!id) return setApplication(null);
      const { data } = await api.get(`/application/${id}`);
      setApplication(data);
    })();
  }, [hit._id]);

  if (!application) return <i style={{ color: colors.darkPurple }}>Chargement...</i>;

  options = [APPLICATION_STATUS.IN_PROGRESS, APPLICATION_STATUS.DONE, APPLICATION_STATUS.ABANDON];
  if (application.status === APPLICATION_STATUS.WAITING_VALIDATION) options = [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.REFUSED, APPLICATION_STATUS.CANCEL];
  if ([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role))
    options = [
      APPLICATION_STATUS.WAITING_VALIDATION,
      APPLICATION_STATUS.VALIDATED,
      APPLICATION_STATUS.REFUSED,
      APPLICATION_STATUS.CANCEL,
      APPLICATION_STATUS.IN_PROGRESS,
      APPLICATION_STATUS.DONE,
      APPLICATION_STATUS.ABANDON,
    ];

  const onClickStatus = (status) => {
    setModalConfirm({
      isOpen: true,
      title: "Êtes-vous sûr(e) de vouloir modifier le statut de cette candidature?\nUn email sera automatiquement envoyé.",
      onConfirm: () => handleClickStatus(status),
    });
  };

  const handleClickStatus = (status) => {
    if (status === APPLICATION_STATUS.REFUSED) setModalRefuse({ isOpen: true });
    else setStatus(status);
  };

  const setStatus = async (status, message) => {
    try {
      const { ok, code, data } = await api.put("/application", { _id: application._id, status });
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      setApplication(data);
      toastr.success("Mis à jour!");
      if (status === APPLICATION_STATUS.VALIDATED) {
        await api.post(`/application/${data._id}/notify/validated_responsible`);
        await api.post(`/application/${data._id}/notify/validated_young`);
      } else {
        await api.post(`/application/${data._id}/notify/${status.toLowerCase()}`, { message });
      }
      callback && callback(status);
    } catch (e) {
      console.log(e);
      if (e.code !== "NO_TEMPLATE_FOUND") toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  };

  return (
    <>
      <ActionBox color={APPLICATION_STATUS_COLORS[application.status]}>
        <UncontrolledDropdown setActiveFromChild>
          <DropdownToggle tag="button">
            {translate(application.status)}
            <Chevron color={APPLICATION_STATUS_COLORS[application.status]} />
          </DropdownToggle>
          <DropdownMenu>
            {options.map((status) => {
              return (
                <DropdownItem key={status} className="dropdown-item" onClick={() => onClickStatus(status)}>
                  {translate(status)}
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        </UncontrolledDropdown>
      </ActionBox>
      <ModalConfirmWithMessage
        isOpen={modalRefuse.isOpen}
        title="Veuillez éditer le message ci-dessous pour préciser les raisons du refus avant de l'envoyer"
        message={`Une fois le message ci-dessous validé, il sera transmis par mail à ${application.youngFirstName} (${application.youngEmail}).`}
        onChange={() => setModalRefuse({ isOpen: false, data: null })}
        onConfirm={(msg) => {
          setStatus(APPLICATION_STATUS.REFUSED, msg);
          setModalRefuse({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalConfirm
        isOpen={modalConfirm?.isOpen}
        title={modalConfirm?.title}
        message={modalConfirm?.message}
        onChange={() => setModalConfirm({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modalConfirm?.onConfirm();
          setModalConfirm({ isOpen: false, onConfirm: null });
        }}
      />
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
