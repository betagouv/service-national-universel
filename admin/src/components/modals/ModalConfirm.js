import React, { useState } from "react";
import { Modal } from "reactstrap";

import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";

export default ({ topTitle, title, message, onChange, onConfirm }) => {
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    onConfirm();
  };

  return (
    <Modal isOpen={true} toggle={onChange}>
      <ModalContainer>
        <img src={require("../../assets/close.svg")} height={10} onClick={onChange} />
        <Header>{topTitle}</Header>
        <Content>
          <h1>{title}</h1>
          <p>{message}</p>
        </Content>
        <Footer>
          <ModalButton loading={sending} disabled={sending} color="#5245cc" onClick={submit} primary>
            Confirmer
          </ModalButton>
          <ModalButton disabled={sending} color="#5245cc" onClick={onChange}>
            Annuler
          </ModalButton>
        </Footer>
      </ModalContainer>
    </Modal>
  );
};
