import React, { useState } from "react";
import { Modal } from "reactstrap";

import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";
import CloseSvg from "../../assets/Close";
import RoundWarning from "../../assets/RoundWarning";

export default function ModalConfirm({
  isOpen,
  showHeaderText = true,
  headerText = "alerte",
  showHeaderIcon = false,
  title,
  message,
  onChange,
  onCancel,
  onConfirm,
  confirmText = "Confirmer",
  cancelText = "Annuler",
}) {
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    onConfirm();
    setSending(false);
  };

  return (
    <Modal centered isOpen={isOpen} toggle={onCancel || onChange}>
      <ModalContainer>
        <CloseSvg className="close-icon" height={10} onClick={onCancel || onChange} />
        {showHeaderText ? <Header>{headerText}</Header> : null}
        {showHeaderIcon ? <RoundWarning style={{ marginBottom: "1.5rem" }} /> : null}
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
