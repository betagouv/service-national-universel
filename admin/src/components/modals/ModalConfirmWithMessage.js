import React, { useState } from "react";
import { Modal } from "reactstrap";

import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";

export default ({ isOpen, topTitle = "alerte", title, message, defaultInput, onChange, onConfirm, placeholder = "Votre message...", type = "textarea" }) => {
  const [messageTextArea, setMessageTextArea] = useState(defaultInput);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    onConfirm(messageTextArea);
  };
  const renderInput = () => {
    if (type === "textarea") return <textarea placeholder={placeholder} rows="15" value={messageTextArea} onChange={(e) => setMessageTextArea(e.target.value)} />;
    if (type === "number") return <input placeholder={placeholder} onChange={(e) => setMessageTextArea(e.target.value)} value={messageTextArea} type="number" min={1} max={999} />;
  };

  return (
    <Modal isOpen={isOpen} toggle={onChange}>
      <ModalContainer>
        <img src={require("../../assets/close.svg")} height={10} onClick={onChange} />
        <Header>{topTitle}</Header>
        <Content>
          <h1>{title}</h1>
          <p>{message}</p>
          {renderInput()}
        </Content>
        <Footer>
          <ModalButton loading={sending} disabled={sending || !messageTextArea} onClick={submit} primary>
            Confirmer
          </ModalButton>
          <ModalButton disabled={sending} onClick={onChange}>
            Annuler
          </ModalButton>
        </Footer>
      </ModalContainer>
    </Modal>
  );
};
