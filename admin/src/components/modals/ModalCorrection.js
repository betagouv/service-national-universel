import React, { useEffect, useState } from "react";
import { Modal } from "reactstrap";
import { toastr } from "react-redux-toastr";

import api from "../../services/api";
import { SENDINBLUE_TEMPLATES } from "../../utils";
import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";

export default function ModalCorrection({ isOpen, value, onChange, onSend, topTitle = "alerte" }) {
  const [message, setMessage] = useState();
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setMessage("");
  }, [value]);

  if (!value) return <div />;

  const send = async () => {
    setSending(true);
    await api.post(`/young/${value._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_CORRECTION}`, { message });
    toastr.success("Email envoyé !");
    setSending(false);
    onSend(message);
  };

  return (
    <Modal isOpen={isOpen} toggle={onChange}>
      <ModalContainer>
        <img src={require("../../assets/close.svg")} height={10} onClick={onChange} />
        <Header>{topTitle}</Header>
        <Content>
          <h1>Veuillez éditer le message ci-dessous pour préciser les corrections à apporter avant de l&apos;envoyer :</h1>
          <p style={{ alignSelf: "flex-start", textAlign: "left" }}>
            Bonjour {value.firstName} {value.lastName}, <br />
            Votre dossier d&apos;inscription a été vérifié et est en attente de correction de votre part. Pour finaliser votre inscription au SNU, merci de suivre les éléments
            renseignés par votre référent SNU :
          </p>
          <textarea placeholder="Renseignez ici les éléments à modifier..." rows="8" value={message} onChange={(e) => setMessage(e.target.value)} />
          <p style={{ alignSelf: "flex-start", textAlign: "left" }}>
            Cordialement, <br />
            Les équipes du Service National Universel.
          </p>
        </Content>
        <Footer>
          <ModalButton loading={sending} disabled={sending || !message} onClick={send} primary>
            Confirmer
          </ModalButton>
          <ModalButton disabled={sending} onClick={onChange}>
            Annuler
          </ModalButton>
        </Footer>
      </ModalContainer>
    </Modal>
  );
}
