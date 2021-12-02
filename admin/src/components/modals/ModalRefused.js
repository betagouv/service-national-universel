import React, { useEffect, useState } from "react";
import { Modal } from "reactstrap";

import api from "../../services/api";
import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";

import { toastr } from "react-redux-toastr";
import { SENDINBLUE_TEMPLATES } from "../../utils";

export default function ModalRefused({ isOpen, value, onChange, onSend, topTitle = "alerte" }) {
  const [message, setMessage] = useState();
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setMessage(`Nous n'avons malheureusement pu donner suite à votre dossier d'inscription à la prochaine édition du Service Nationale Universel.
En voici les principales raisons :
-
-

Merci pour votre compréhension.
En vous souhaitant une excellente continuation.`);
  }, [value]);

  if (!value) return <div />;

  const send = async () => {
    setSending(true);
    await api.post(`/young/${value._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_REFUSED}`, { message });
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
          <h1>Veuillez éditer le message ci-dessous pour préciser les raisons du refus avant de l&apos;envoyer&nbsp;:</h1>
          <p style={{ alignSelf: "flex-start", textAlign: "left" }}>
            Bonjour {value.firstName} {value.lastName}, <br />
            Suite au traitement de votre dossier d’inscription, le référent SNU de votre département n’a pu retenir votre inscription. Ce dernier vous a laissé un message :
          </p>
          <textarea rows="8" value={message} onChange={(e) => setMessage(e.target.value)} />
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
