import React, { useState } from "react";
import { Modal } from "reactstrap";

import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";
import CloseSvg from "../../assets/Close";
import ButtonLight from "../ui/buttons/ButtonLight";
import ButtonPrimary from "../ui/buttons/ButtonPrimary";
import CheckCircle from "../../assets/icons/CheckCircle";

export default function ModalConfirm({ isOpen, topTitle = "alerte", title, message, onChange, onCancel, onConfirm, confirmText = "Confirmer", cancelText = "Annuler" }) {
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    await onConfirm();
    setSending(false);
  };

  return (
    <Modal centered isOpen={isOpen} toggle={onCancel || onChange}>
      <ModalContainer>
        <CloseSvg className="close-icon" height={10} width={10} onClick={onCancel || onChange} />
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

const NewModalConfirm = ({ isOpen = false, icon = <CheckCircle />, title = "", children = null, onConfirm: handleConfirm = () => {}, onCancel: handleCancel = () => {} }) => (
  <Modal isOpen={isOpen} className="w-[512px] bg-white rounded-xl p-6">
    <Modal.Header>
      {icon}
      <h2 className="my-0 text-xl font-bold">{title}</h2>
    </Modal.Header>
    <Modal.Content>{children}</Modal.Content>
    <Modal.Footer>
      <ButtonLight onClick={handleCancel}>Annuler</ButtonLight>
      <ButtonPrimary className="drop-shadow-none shadow-ninaBlue" onClick={handleConfirm}>
        Confirmer
      </ButtonPrimary>
    </Modal.Footer>
  </Modal>
);

export { NewModalConfirm };
