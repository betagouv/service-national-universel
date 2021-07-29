import React, { useEffect, useState } from "react";
import { Modal } from "reactstrap";

import api from "../../services/api";

import { toastr } from "react-redux-toastr";
import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";
import { SENDINBLUE_TEMPLATES } from "../../utils";
import { appURL } from "../../config";

export default ({ topTitle, title, message, onChange, onConfirm, young, placeholder = "Votre message..." }) => {
  const [messageTextArea, setMessageTextArea] = useState();
  const [sending, setSending] = useState(false);

  if (!young) return <div />;

  const send = async () => {
    setSending(true);
    await api.post(`/email/send-template/${SENDINBLUE_TEMPLATES.YOUNG_MILITARY_PREPARATION_DOCS_CORRECTION}`, {
      emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
      params: { message: messageTextArea, cta: `${appURL}/ma-preparation-militaire` },
    });
    toastr.success("Email envoyé !");
    onConfirm(messageTextArea);
  };

  return (
    <Modal isOpen={true} toggle={onChange}>
      <ModalContainer>
        <img src={require("../../assets/close.svg")} height={10} onClick={onChange} />
        <Header>{topTitle}</Header>
        <Content>
          <h1>{title}</h1>
          <p>{message}</p>
          <textarea placeholder={placeholder} rows="15" value={messageTextArea} onChange={(e) => setMessageTextArea(e.target.value)} />
        </Content>
        <Footer>
          <ModalButton loading={sending} disabled={sending || !messageTextArea} onClick={send} primary>
            Envoyer la demande de correction
          </ModalButton>
          <ModalButton disabled={sending} color="#5245cc" onClick={onChange}>
            Annuler
          </ModalButton>
        </Footer>
      </ModalContainer>
    </Modal>
  );
};
