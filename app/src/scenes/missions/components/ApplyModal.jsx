import Img2 from "../../../assets/close.svg";
import React, { useState } from "react";
import { Modal } from "reactstrap";
import styled from "styled-components";
import useAuth from "@/services/useAuth";
import Loader from "../../../components/Loader";

import api from "../../../services/api";
import { APPLICATION_STATUS } from "../../../utils";

import { toastr } from "react-redux-toastr";
import plausibleEvent from "../../../services/plausible";
import { capture } from "../../../sentry";

export default function ApplyModal({ value, onChange, onSend, onCancel }) {
  const [sending, setSending] = useState(false);
  const { young } = useAuth();

  if (!value) return <div />;

  const send = async () => {
    setSending(true);
    const application = {
      youngId: young._id,
      youngFirstName: young.firstName,
      youngLastName: young.lastName,
      youngEmail: young.email,
      youngBirthdateAt: young.birthdateAt,
      youngCity: young.city,
      youngDepartment: young.department,
      youngCohort: young.cohort,
      missionId: value._id,
      missionName: value.name,
      missionDepartment: value.department,
      missionRegion: value.region,
      missionDuration: value.duration,
      structureId: value.structureId,
      tutorId: value.tutorId,
      tutorName: value.tutorName,
    };

    if (value.isMilitaryPreparation === "true") {
      if (["VALIDATED"].includes(young.statusMilitaryPreparationFiles)) {
        application.status = APPLICATION_STATUS.WAITING_VALIDATION;
      } else {
        application.status = APPLICATION_STATUS.WAITING_VERIFICATION;
      }
    }

    const clickId = localStorage.getItem("jva_mission_click_id");

    try {
      const { ok, code } = await api.post(`/application${clickId ? `?clickId=${clickId}` : ""}`, application);
      if (!ok) return toastr.error("Oups, une erreur est survenue lors de la candidature", code);
    } catch (e) {
      capture(e);
      onCancel?.();
      return toastr.error("Oups, une erreur est survenue lors de la candidature");
    }
    plausibleEvent("Phase2/CTA - Confirmer candidature");
    onSend();
  };

  return (
    <Modal centered isOpen={true} toggle={onChange} style={{}}>
      <ModalContainer>
        <img src={Img2} height={10} width={10} onClick={onChange} />
        <h1>Je souhaite proposer ma candidature pour cette mission</h1>
        <h3>Votre profil sera proposé à la structure, elle disposera de vos coordonnées pour valider votre participation.</h3>
        {sending ? (
          <Loader size="2rem" />
        ) : (
          <>
            <Button disabled={sending} onClick={send}>
              Confirmer&nbsp;ma&nbsp;candidature
            </Button>
            <CancelButton onClick={onChange}>Annuler</CancelButton>
          </>
        )}
      </ModalContainer>
    </Modal>
  );
}

const ModalContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2.5rem;
  flex-direction: column;
  img {
    position: absolute;
    right: 0;
    top: 0;
    margin: 1rem;
    cursor: pointer;
  }
  h1 {
    font-size: 1.2rem;
    text-align: center;
  }
  h3 {
    margin: 1rem 0;
    text-align: center;
    color: #929292;
    font-size: 1rem;
    font-weight: 300;
  }
  textarea {
    padding: 1rem;
    line-height: 1.5;
    border-radius: 0.5rem;
    border: 1px solid #ccc;
    min-width: 100%;
  }
`;

const Button = styled.div`
  cursor: pointer;
  background-color: #31c48d;
  border-radius: 30px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  color: #fff;
  font-size: 1rem;
  padding: 0.8rem 3rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
  }
  :hover {
    color: #fff;
    background-color: #0e9f6e;
  }
`;

const CancelButton = styled.div`
  cursor: pointer;
  background-color: transparent;
  color: #777;
  text-transform: uppercase;
  font-size: 0.8rem;
  margin-top: 1rem;
  :hover {
    color: #111;
  }
`;
