import React, { useState } from "react";
import { Modal } from "reactstrap";

import { ModalContainer, Content, Header, Footer } from "./Modal";
import ModalButton from "../buttons/ModalButton";
import RoundWarning from "../../assets/RoundWarning";

export default function ModalConfirm({ isOpen, title, message, onConfirm, confirmText = "Confirmer" }) {
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    onConfirm();
    setSending(false);
  };

  return (
    <Modal centered isOpen={isOpen}>
      <ModalContainer>
        <Content>
          <RoundWarning borderColor="#FABB10" backgroundColor="#FABB1033" style={{ marginBottom: "1.5rem" }} />
          <h1>{title}</h1>
          <p>{message}</p>
        </Content>
        <Footer>
          <ModalButton loading={sending} disabled={sending} onClick={submit} primary>
            {confirmText}
          </ModalButton>
        </Footer>
      </ModalContainer>
    </Modal>
  );
}
