import React, { useState } from "react";
import { Modal } from "reactstrap";

import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";
import CloseSvg from "../../assets/Close";
import RoundWarning from "../../assets/RoundWarning";

export default function ModalInfo({
  isOpen,
  showHeaderText = true,
  headerText = "information",
  showHeaderIcon = false,
  title,
  message,
  onClose,
  size = "md",
  closeText = "Fermer",
  children = <></>,
}) {
  const [sending, setSending] = useState(false);

  const close = async () => {
    setSending(true);
    await onClose();
    setSending(false);
  };

  return (
    <Modal size={size} centered isOpen={isOpen} toggle={onClose}>
      <ModalContainer className="pb-0">
        <CloseSvg className="close-icon" height={10} width={10} onClick={onClose} />
        {showHeaderText ? <Header className="!text-[#5145cd]">{headerText}</Header> : null}
        {showHeaderIcon ? <RoundWarning style={{ marginBottom: "1.5rem" }} /> : null}
        <Content>
          <h1>{title}</h1>
          <p>{message}</p>
          {children}
        </Content>
        <Footer>
          <ModalButton loading={sending} onClick={close} primary>
            {closeText}
          </ModalButton>
        </Footer>
      </ModalContainer>
    </Modal>
  );
}
