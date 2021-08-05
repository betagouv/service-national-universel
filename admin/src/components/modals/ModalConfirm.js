import React, { useState } from "react";
import { Modal } from "reactstrap";

import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";

//todo : onChange => onCancel
export default ({ isOpen, topTitle = "alerte", title, message, onChange, onConfirm, confirmText = "Confirmer", cancelText = "Annuler" }) => {
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    onConfirm();
    setSending(false);
  };

  return (
    <Modal isOpen={isOpen} toggle={onChange}>
      <ModalContainer>
        <img src={require("../../assets/close.svg")} height={10} onClick={onChange} />
        <Header>{topTitle}</Header>
        <Content>
          <h1>{title}</h1>
          <p>{message}</p>
        </Content>
        <Footer>
          <ModalButton loading={sending} disabled={sending} color="#5245cc" onClick={submit} primary>
            {confirmText}
          </ModalButton>
          <ModalButton disabled={sending} color="#5245cc" onClick={onChange}>
            {cancelText}
          </ModalButton>
        </Footer>
      </ModalContainer>
    </Modal>
  );
};
