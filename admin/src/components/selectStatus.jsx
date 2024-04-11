import React, { useEffect, useState } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { ModalConfirmation } from "@snu/ds/admin";
import { IoWarningOutline } from "react-icons/io5";

import api from "../services/api";

import {
  translate,
  translatePhase1,
  translatePhase2,
  YOUNG_STATUS,
  YOUNG_PHASE,
  YOUNG_STATUS_COLORS,
  /* isEndOfInscriptionManagement2021, ROLES, */ colors,
  SENDINBLUE_TEMPLATES,
  WITHRAWN_REASONS,
  ROLES,
} from "../utils";
import { toastr } from "react-redux-toastr";

import ModalCorrection from "./modals/ModalCorrection";
import ModalRefused from "./modals/ModalRefused";
import ModalWithdrawn from "./modals/ModalWithdrawn";
import Chevron from "./Chevron";
import ModalConfirm from "./modals/ModalConfirm";
import ModalConfirmMultiAction from "./modals/ModalConfirmMultiAction";
import { YOUNG_STATUS_PHASE2, isCle, translateInscriptionStatus } from "snu-lib";

const lookUpAuthorizedStatus = ({ status, role }) => {
  switch (status) {
    case YOUNG_STATUS.WAITING_VALIDATION:
      return [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.WITHDRAWN];
    case YOUNG_STATUS.WAITING_CORRECTION:
      return [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.WITHDRAWN];
    case YOUNG_STATUS.WAITING_LIST:
      return [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WITHDRAWN];
    case YOUNG_STATUS.WITHDRAWN:
      if (role === ROLES.ADMIN) return [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WAITING_LIST];
      else return [];
    case YOUNG_STATUS.VALIDATED:
      return [YOUNG_STATUS.WITHDRAWN];
    default:
      return [];
  }
};

export default function SelectStatus({ hit, options = Object.keys(YOUNG_STATUS), statusName = "status", phase = YOUNG_PHASE.INSCRIPTION, disabled, callback = () => {} }) {
  const [modal, setModal] = useState(null);
  const [young, setYoung] = useState(null);
  const user = useSelector((state) => state.Auth.user);
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, onConfirm: null });
  const [modalGoal, setModalGoal] = useState({ isOpen: false, onConfirm: null });
  const [isModalValidatePhase2Open, setModalValidatePhase2] = useState(false);
  const [newStatus, setNewStatus] = useState(null);

  const getInscriptionGoalReachedNormalized = async ({ department, cohort }) => {
    const { data, ok, code } = await api.get(`/inscription-goal/${encodeURIComponent(cohort)}/department/${encodeURIComponent(department)}`);
    if (!ok) {
      toastr.error("Oups, une erreur s'est produite", translate(code));
      return null;
    }
    return data;
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
    if (statusName === "statusPhase2" && status === YOUNG_STATUS_PHASE2.VALIDATED) {
      setNewStatus(status);
      setModalValidatePhase2(true);
    } else {
      setModalConfirm({
        isOpen: true,
        onConfirm: async () => {
          if ([YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WITHDRAWN].includes(status)) return setModal(status);
          if (status === YOUNG_STATUS.VALIDATED && phase === YOUNG_PHASE.INSCRIPTION) {
            const fillingRate = await getInscriptionGoalReachedNormalized({ department: young.department, cohort: young.cohort });
            if (fillingRate >= 1)
              return setModalGoal({
                isOpen: true,
                onConfirm: () => setStatus(YOUNG_STATUS.WAITING_LIST),
                confirmText: "Placer en liste complémentaire",
                onConfirm2: () => setStatus(YOUNG_STATUS.VALIDATED),
                confirmText2: "Valider quand même",
                title: "Jauge de candidats atteinte",
                message:
                  "Attention, vous avez atteint la jauge, merci de placer le candidat sur liste complémentaire ou de vous rapprocher de votre coordinateur régional avant de valider la candidature.",
              });
          }
          setStatus(status);
        },
        title: "Modification de statut",
        message: "Êtes-vous sûr(e) de vouloir modifier le statut de ce profil?\nUn email sera automatiquement envoyé à l'utilisateur.",
      });
    }
  };

  const setStatus = async (status, values) => {
    const prevStatus = young.status;
    if (status === "WITHDRAWN") {
      young.historic.push({
        phase,
        userName: `${user.firstName} ${user.lastName}`,
        userId: user._id,
        status,
        note: WITHRAWN_REASONS.find((r) => r.value === values?.withdrawnReason)?.label + " " + values?.withdrawnMessage,
      });
    } else young.historic.push({ phase, userName: `${user.firstName} ${user.lastName}`, userId: user._id, status, note: values?.note });
    young[statusName] = status;
    const now = new Date();
    young.lastStatusAt = now.toISOString();
    if (statusName === "statusPhase2") young.statusPhase2UpdatedAt = now.toISOString();
    if (statusName === "statusPhase2" && status === YOUNG_STATUS_PHASE2.VALIDATED) young.statusPhase2ValidatedAt = now.toISOString();
    if (statusName === "statusPhase3") young.statusPhase3UpdatedAt = now.toISOString();
    if (status === "WITHDRAWN" && (values?.withdrawnReason || values?.withdrawnMessage)) {
      young.withdrawnReason = values?.withdrawnReason;
      young.withdrawnMessage = values?.withdrawnMessage || "";
    }
    if (status === "WAITING_CORRECTION" && values?.note) young.inscriptionCorrectionMessage = values?.note;
    if (status === "REFUSED" && values?.note) young.inscriptionRefusedMessage = values?.note;
    if (status === YOUNG_STATUS.VALIDATED && phase === YOUNG_PHASE.INTEREST_MISSION) young.phase = YOUNG_PHASE.CONTINUE;
    try {
      // we decided to let the validated youngs in the INSCRIPTION phase
      // referents use the export and need ALL the youngs of the current year
      // we'll pass every youngs currently in INSCRIPTION in COHESION_STAY once the campaign is done (~20 april 2021)

      // if (status === YOUNG_STATUS.VALIDATED && young.phase === YOUNG_PHASE.INSCRIPTION) {
      //   young.phase = YOUNG_PHASE.COHESION_STAY;
      // }

      const { lastStatusAt, statusPhase2UpdatedAt, statusPhase3UpdatedAt, withdrawnMessage, phase, inscriptionCorrectionMessage, inscriptionRefusedMessage, withdrawnReason } =
        young;

      const shouldValidateStatusPhase2 = statusName === "statusPhase2" && young[statusName] === YOUNG_STATUS.VALIDATED;
      const shouldValidateStatusPhase3 = statusName === "statusPhase3" && young[statusName] === YOUNG_STATUS.VALIDATED;

      const {
        ok,
        code,
        data: newYoung,
      } = await api.put(`/referent/young/${young._id}`, {
        [statusName]: young[statusName],
        lastStatusAt,
        ...(statusName === "statusPhase2" && { statusPhase2UpdatedAt }),
        ...(shouldValidateStatusPhase2 && { statusPhase2ValidatedAt: statusPhase2UpdatedAt }),
        ...(statusName === "statusPhase3" && { statusPhase3UpdatedAt }),
        ...(shouldValidateStatusPhase3 && { statusPhase3ValidatedAt: statusPhase3UpdatedAt }),
        withdrawnMessage,
        phase,
        inscriptionCorrectionMessage,
        inscriptionRefusedMessage,
        withdrawnReason,
      });
      if (!ok) {
        setModalValidatePhase2(false);
        return toastr.error("Une erreur s'est produite :", translate(code));
      }

      const validationTemplate = isCle(young) ? SENDINBLUE_TEMPLATES.young.INSCRIPTION_VALIDATED_CLE : SENDINBLUE_TEMPLATES.young.INSCRIPTION_VALIDATED;

      if (status === YOUNG_STATUS.VALIDATED && phase === YOUNG_PHASE.INSCRIPTION) {
        if (prevStatus === "WITHDRAWN") await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_REACTIVATED}`);
        else await api.post(`/young/${young._id}/email/${validationTemplate}`);
      }
      if (status === YOUNG_STATUS.WAITING_LIST) {
        await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_LIST}`);
      }
      setYoung(newYoung);
      setModalValidatePhase2(false);
      toastr.success("Mis à jour!");
      callback();
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue :", translate(e.code));
      setModalValidatePhase2(false);
    }
  };

  const translator = (status) => {
    if (statusName === "statusPhase1") {
      return translatePhase1(status);
    } else if (statusName === "statusPhase2") {
      return translatePhase2(status);
    } else if (statusName === "status") {
      return translateInscriptionStatus(status);
    } else {
      return translate(status);
    }
  };

  if (statusName === "status") {
    options = lookUpAuthorizedStatus({ status: young[statusName], role: user.role });
  }

  return (
    <>
      <ModalConfirm
        isOpen={modalConfirm?.isOpen}
        title={modalConfirm?.title}
        message={modalConfirm?.message}
        headerText="Confirmation"
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
        onSend={(note) => {
          setStatus(YOUNG_STATUS.WAITING_CORRECTION, { note });
          setModal(null);
        }}
      />
      <ModalRefused
        isOpen={modal === YOUNG_STATUS.REFUSED}
        value={young}
        onChange={() => setModal(false)}
        onSend={(note) => {
          setStatus(YOUNG_STATUS.REFUSED, { note });
          setModal(null);
        }}
      />
      <ModalWithdrawn
        young={young}
        isOpen={modal === YOUNG_STATUS.WITHDRAWN}
        title="Desistement du SNU"
        message="Précisez la raison du désistement"
        placeholder="Précisez en quelques mots les raisons du désistement du volontaire"
        onChange={() => setModal(false)}
        onConfirm={(values) => {
          setStatus(YOUNG_STATUS.WITHDRAWN, values);
          setModal(null);
        }}
      />
      <ModalConfirmMultiAction
        showHeaderIcon={true}
        showHeaderText={false}
        isOpen={modalGoal?.isOpen}
        title={modalGoal?.title}
        message={modalGoal?.message}
        confirmText={modalGoal?.confirmText}
        confirmText2={modalGoal?.confirmText2}
        onConfirm={() => {
          modalGoal?.onConfirm?.();
          setModalGoal({ isOpen: false, onConfirm: null });
          setModal(null);
        }}
        onConfirm2={() => {
          modalGoal?.onConfirm2?.();
          setModalGoal({ isOpen: false, onConfirm: null });
          setModal(null);
        }}
        onCancel={() => {
          setModalGoal({ isOpen: false, onConfirm: null });
          setModal(null);
        }}
      />
      <ModalConfirmation
        isOpen={modalValidatePhase2}
        onClose={() => {
          setModalValidatePhase2(false);
        }}
        className="md:max-w-[700px]"
        icon={<IoWarningOutline className="text-amber-500" size={40} />}
        title="Attention, vous êtes sur le point de valider la phase 2 de ce volontaire"
        text="Cette action entraînera l'abandon des candidatures et des demandes d'équivalence encore en cours. Êtes-vous sûr de vouloir continuer ?"
        actions={[
          { title: "Annuler", isCancel: true },
          { title: "Confirmer", onClick: () => setStatus(newStatus) },
        ]}
      />

      <ActionBox color={YOUNG_STATUS_COLORS[young[statusName]]}>
        <UncontrolledDropdown setActiveFromChild>
          <DropdownToggle tag="button" disabled={disabled || !options.length}>
            {translator(young[statusName])}
            {!!options.length && !disabled && <Chevron color={YOUNG_STATUS_COLORS[young[statusName]]} />}
          </DropdownToggle>
          <DropdownMenu>
            {options
              .filter((e) => e !== young[statusName])
              .map((status) => {
                return (
                  <DropdownItem key={status} className="dropdown-item" onClick={() => handleClickStatus(status)}>
                    {translator(status)}
                  </DropdownItem>
                );
              })}
          </DropdownMenu>
        </UncontrolledDropdown>
        {/* <div>{JSON.stringify(young)}</div> */}
      </ActionBox>
    </>
  );
}

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
