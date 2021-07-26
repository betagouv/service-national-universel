import React, { useEffect, useState } from "react";
import { Modal } from "reactstrap";

import api from "../../services/api";

import { toastr } from "react-redux-toastr";
import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";
import { SENDINBLUE_TEMPLATES } from "../../utils";

export default ({ topTitle, title, message, onChange, onConfirm, young }) => {
  const [messageTextArea, setMessageTextArea] = useState();
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setMessageTextArea(`Bonjour ${young.firstName} ${young.lastName},
les docs sont pas bons. c'est mort`);
  }, [young]);

  if (!young) return <div />;

  const send = async () => {
    setSending(true);
    await api.post(`/email/send-template/${SENDINBLUE_TEMPLATES.MILITARY_PREPARATION_DOCS_REFUSED}`, {
      emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
      params: { message: messageTextArea },
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
          <textarea rows="15" value={messageTextArea} onChange={(e) => setMessageTextArea(e.target.value)} />
        </Content>
        <Footer>
          <ModalButton loading={sending} disabled={sending || !messageTextArea} onClick={send} primary>
            Confirmer
          </ModalButton>
          <ModalButton disabled={sending} color="#5245cc" onClick={onChange}>
            Annuler
          </ModalButton>
        </Footer>
      </ModalContainer>
    </Modal>
  );
};
