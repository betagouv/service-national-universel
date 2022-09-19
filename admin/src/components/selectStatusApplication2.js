import React, { useEffect, useState } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";

import api from "../services/api";

import { translate, translateApplication, APPLICATION_STATUS, ROLES, colors, SENDINBLUE_TEMPLATES } from "../utils";
import { toastr } from "react-redux-toastr";
import Chevron from "./Chevron";
import ModalConfirmWithMessage from "./modals/ModalConfirmWithMessage";
import ModalConfirm from "./modals/ModalConfirm";

const lookUpAuthorizedStatus = ({ status, role }) => {
  if ([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(role)) {
    return [
      APPLICATION_STATUS.WAITING_ACCEPTATION,
      APPLICATION_STATUS.WAITING_VERIFICATION,
      APPLICATION_STATUS.WAITING_VALIDATION,
      APPLICATION_STATUS.VALIDATED,
      APPLICATION_STATUS.IN_PROGRESS,
      APPLICATION_STATUS.DONE,
      APPLICATION_STATUS.CANCEL,
      APPLICATION_STATUS.ABANDON,
      APPLICATION_STATUS.REFUSED,
    ];
  } else {
    switch (status) {
      case APPLICATION_STATUS.WAITING_ACCEPTATION:
        return [APPLICATION_STATUS.REFUSED];
      case APPLICATION_STATUS.WAITING_VALIDATION:
        return [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.REFUSED];
      case APPLICATION_STATUS.VALIDATED:
        return [APPLICATION_STATUS.IN_PROGRESS, APPLICATION_STATUS.DONE, APPLICATION_STATUS.ABANDON];
      case APPLICATION_STATUS.IN_PROGRESS:
        return [APPLICATION_STATUS.DONE, APPLICATION_STATUS.ABANDON];
      case APPLICATION_STATUS.WAITING_VERIFICATION:
        return [APPLICATION_STATUS.REFUSED, APPLICATION_STATUS.VALIDATED];
      case APPLICATION_STATUS.REFUSED:
      case APPLICATION_STATUS.CANCEL:
      case APPLICATION_STATUS.DONE:
      case APPLICATION_STATUS.ABANDON:
        return [];
      default:
        return [];
    }
  }
};

export default function SelectStatusApplication({ hit, options = [], callback }) {
  const [application, setApplication] = useState(null);
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, onConfirm: null });
  const [modalRefuse, setModalRefuse] = useState({ isOpen: false, onConfirm: null });
  const [modalDone, setModalDone] = useState({ isOpen: false, onConfirm: null });

  const user = useSelector((state) => state.Auth.user);

  const theme = {
    background: {
      WAITING_VALIDATION: "rgb(224 242 254)",
      WAITING_VERIFICATION: "rgb(224 242 254)",
      WAITING_ACCEPTATION: "rgb(249 115 22)",
      VALIDATED: "#71C784",
      DONE: "#5694CD",
      REFUSED: "#0B508F",
      CANCEL: "#F4F4F4",
      IN_PROGRESS: "rgb(79 70 229)",
      ABANDON: "rgb(249 250 251)",
    },
    text: {
      WAITING_VALIDATION: "rgb(2 132 199)",
      WAITING_VERIFICATION: "rgb(2 132 199)",
      WAITING_ACCEPTATION: "#fff",
      VALIDATED: "#fff",
      DONE: "#fff",
      REFUSED: "#fff",
      CANCEL: "#6B6B6B",
      IN_PROGRESS: "#fff",
      ABANDON: "rgb(156 163 175)",
    },
  };

  useEffect(() => {
    (async () => {
      const id = hit && hit._id;
      if (!id) return setApplication(null);
      const { data } = await api.get(`/application/${id}`);
      setApplication(data);
    })();
  }, [hit._id]);

  if (!application) return <i style={{ color: colors.darkPurple }}>Chargement...</i>;

  options = lookUpAuthorizedStatus({ status: application.status, role: user.role });

  const onClickStatus = (status) => {
    setModalConfirm({
      isOpen: true,
      title: "Êtes-vous sûr(e) de vouloir modifier le statut de cette candidature?\nUn email sera automatiquement envoyé.",
      onConfirm: () => handleClickStatus(status),
    });
  };

  const handleClickStatus = (status) => {
    if (status === APPLICATION_STATUS.REFUSED) setModalRefuse({ isOpen: true });
    else if (status === APPLICATION_STATUS.DONE) setModalDone({ isOpen: true });
    else setStatus(status);
  };

  const setStatus = async (status, message, duration) => {
    try {
      const { ok, code, data } = await api.put("/application", { _id: application._id, status, missionDuration: duration });
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      setApplication(data);
      toastr.success("Mis à jour!");
      if (status === APPLICATION_STATUS.VALIDATED) {
        await api.post(`/application/${data._id}/notify/${SENDINBLUE_TEMPLATES.referent.YOUNG_VALIDATED}`);
        await api.post(`/application/${data._id}/notify/${SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION}`);
      } else if (status === APPLICATION_STATUS.CANCEL) {
        await api.post(`/application/${data._id}/notify/${SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION}`, { message });
      } else if (status === APPLICATION_STATUS.REFUSED) {
        await api.post(`/application/${data._id}/notify/${SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION}`, { message });
      }
      callback && callback(status);
    } catch (e) {
      console.log(e);
      if (e.code !== "NO_TEMPLATE_FOUND") toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  };

  return (
    <>
      <ActionBox background={theme.background[application.status]} color={theme.text[application.status]}>
        <UncontrolledDropdown setActiveFromChild>
          <DropdownToggle tag="button">
            {translateApplication(application.status)}
            <Chevron color={theme.text[application.status]} />
          </DropdownToggle>
          <DropdownMenu>
            {options
              .filter((e) => e !== application.status)
              .map((status) => {
                return (
                  <DropdownItem key={status} className="dropdown-item" onClick={() => onClickStatus(status)}>
                    {translateApplication(status)}
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
        onChange={() => setModalRefuse({ isOpen: false, onConfirm: null })}
        onConfirm={(msg) => {
          setStatus(APPLICATION_STATUS.REFUSED, msg);
          setModalRefuse({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalConfirmWithMessage
        isOpen={modalDone.isOpen}
        title="Validation de réalisation de mission"
        message={`Merci de valider le nombre d'heures effectuées par ${application.youngFirstName} pour la mission ${application.missionName}.`}
        onChange={() => setModalDone({ isOpen: false, onConfirm: null })}
        type="number"
        defaultInput={application.missionDuration}
        placeholder="Nombre d'heures"
        onConfirm={(duration) => {
          setStatus(APPLICATION_STATUS.DONE, null, duration);
          setModalDone({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalConfirm
        isOpen={modalConfirm?.isOpen}
        title={modalConfirm?.title}
        message={modalConfirm?.message}
        onCancel={() => setModalConfirm({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modalConfirm?.onConfirm();
          setModalConfirm({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
}

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
    ${({ background, color }) => `
      background-color: ${background};
      border: 1px solid ${background};
      color: ${color};
    `}
    display: inline-flex;
    align-items: center;
    text-align: left;
    border-radius: 4px;
    padding: 5px 6px;
    font-size: 12px;
    font-weight: 400;
    cursor: pointer;
    outline: 0;
    max-width: 300px;
    .edit-icon {
      height: 17px;
      margin-right: 10px;
      path {
        fill: ${({ color }) => `${color}`};
      }
    }
    .down-icon {
      // margin-left: auto;
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
