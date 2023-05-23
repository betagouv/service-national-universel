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
  size = "md",
  disableConfirm = false,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  children = <></>,
}) {
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    await onConfirm();
    setSending(false);
  };

  return (
    <Modal size={size} centered isOpen={isOpen} toggle={onCancel || onChange}>
      <ModalContainer className="pb-0">
        <CloseSvg className="close-icon" height={10} width={10} onClick={onCancel || onChange} />
        {showHeaderText ? <Header>{headerText}</Header> : null}
        {showHeaderIcon ? <RoundWarning style={{ marginBottom: "1.5rem" }} /> : null}
        <Content>
          <h1>{title}</h1>
          <p>{message}</p>
          {children}
        </Content>
        <Footer>
          <ModalButton loading={sending} disabled={sending || disableConfirm} onClick={submit} primary>
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
