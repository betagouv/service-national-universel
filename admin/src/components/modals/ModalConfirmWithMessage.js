import React, { useState } from "react";
import { Modal } from "reactstrap";

import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";

export default ({ topTitle, title, message, onChange, onConfirm, young, placeholder = "Votre message..." }) => {
  const [messageTextArea, setMessageTextArea] = useState();
  const [sending, setSending] = useState(false);

  if (!young) return <div />;

  const submit = async () => {
    setSending(true);
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
          <ModalButton loading={sending} disabled={sending || !messageTextArea} onClick={submit} primary>
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
