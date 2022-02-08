import React, { useState } from "react";
import { Modal } from "reactstrap";

import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";
import CloseSvg from "../../assets/Close";
import RoundWarning from "../../assets/RoundWarning";

export default function ModalConfirm({
  isOpen,
  showHeaderText = "true",
  headerText = "alerte",
  showHeaderIcon = false,
  title,
  message,
  onChange,
  onCancel,
  onConfirm,
  confirmText = "Confirmer",
  onConfirm2,
  confirmText2 = "Confirmer",
  cancelText = "Annuler",
}) {
  const [{ sending1, sending2 }, setSending] = useState({ sending1: false, sending2: false });

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
          <ModalButton
            loading={sending1}
            disabled={sending1 || sending2}
            onClick={() => {
              setSending((e) => ({ ...e, sending1: true }));
              onConfirm();
              setSending((e) => ({ ...e, sending1: false }));
            }}
            primary>
            {confirmText}
          </ModalButton>
          {onConfirm2 ? (
            <ModalButton
              loading={sending2}
              disabled={sending1 || sending2}
              onClick={() => {
                setSending((e) => ({ ...e, sending2: true }));
                onConfirm2();
                setSending((e) => ({ ...e, sending2: false }));
              }}>
              {confirmText2}
            </ModalButton>
          ) : null}
          <ModalButton disabled={sending1 || sending2} onClick={onCancel || onChange}>
            {cancelText}
          </ModalButton>
        </Footer>
      </ModalContainer>
    </Modal>
  );
}
