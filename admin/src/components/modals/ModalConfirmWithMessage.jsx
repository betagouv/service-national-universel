import React, { useState } from "react";
import { Modal } from "reactstrap";

import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";
import CloseSvg from "../../assets/Close";

export default function ModalConfirmWithMessage({
  isOpen,
  topTitle = "alerte",
  title,
  message,
  defaultInput,
  onChange,
  onConfirm,
  placeholder = "Votre message...",
  type = "textarea",
  endMessage,
}) {
  const [messageTextArea, setMessageTextArea] = useState(defaultInput);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    await onConfirm(messageTextArea);
    setSending(false);
    setMessageTextArea("");
  };
  const renderInput = () => {
    if (type === "textarea") return <textarea placeholder={placeholder} rows="15" value={messageTextArea} onChange={(e) => setMessageTextArea(e.target.value)} />;
    if (type === "number") return <input placeholder={placeholder} onChange={(e) => setMessageTextArea(e.target.value)} value={messageTextArea} type="number" min={1} max={999} />;
    if (type === "missionduration")
      return (
        <input
          placeholder={placeholder}
          onChange={(e) => {
            const value = e.target.value;
            var re = new RegExp(/^([0-9]{1,2})$/);
            if (re.test(value) || !value) {
              setMessageTextArea(e.target.value);
            }
          }}
          value={messageTextArea}
          type="number"
          max={99}
        />
      );
  };

  return (
    <Modal centered isOpen={isOpen} toggle={onChange}>
      <ModalContainer className="pb-0">
        <CloseSvg className="close-icon" height={10} width={10} onClick={onChange} />
        <Header>{topTitle}</Header>
        <Content>
          <h1>{title}</h1>
          <p>{message}</p>
          {renderInput()}
          <p>{endMessage}</p>
        </Content>
        <Footer>
          <ModalButton loading={sending} disabled={sending || !messageTextArea} onClick={submit} newPrimary>
            Confirmer
          </ModalButton>
          <ModalButton disabled={sending} onClick={onChange}>
            Annuler
          </ModalButton>
        </Footer>
      </ModalContainer>
    </Modal>
  );
}
