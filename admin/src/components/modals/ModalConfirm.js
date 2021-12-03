import React, { useState } from "react";
import { Modal } from "reactstrap";

import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";

export default function ModalConfirm({ isOpen, topTitle = "alerte", title, message, onChange, onCancel, onConfirm, confirmText = "Confirmer", cancelText = "Annuler" }) {
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    onConfirm();
    setSending(false);
  };

  return (
    <Modal centered isOpen={isOpen} toggle={onCancel || onChange}>
      <ModalContainer>
        <img src={require("../../assets/close.svg")} height={10} onClick={onCancel || onChange} />
        <Header>{topTitle}</Header>
        <Content>
          <h1>{title}</h1>
          <p>{message}</p>
        </Content>
        <Footer>
          <ModalButton loading={sending} disabled={sending} onClick={submit} primary>
            {confirmText}
          </ModalButton>
          <ModalButton disabled={sending} onClick={onCancel || onChange}>
            {cancelText}
          </ModalButton>
        </Footer>
      </ModalContainer>
    </Modal>
  );
}
