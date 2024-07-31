import React, { useState } from "react";
import { Modal } from "reactstrap";
import styled from "styled-components";

import { ModalContainer, Content, Footer } from "./Modal";
import { colors } from "snu-lib";
import ModalButton from "../buttons/ModalButton";
import YellowWarning from "../../assets/YellowWarning";

export default function ModalCGU({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirmer" }) {
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    onConfirm();
    setSending(false);
  };

  return (
    <Modal centered isOpen={isOpen}>
      <HiddenCloseButtonSuperHack onClick={onCancel} />
      <ModalContainer>
        <IconContent>
          <YellowWarning />
          <Text>
            <h1>{title}</h1>
            <article>{message}</article>
          </Text>
        </IconContent>
        <Footer>
          <ModalButton loading={sending} disabled={sending} onClick={submit} primary>
            {confirmText}
          </ModalButton>
        </Footer>
      </ModalContainer>
    </Modal>
  );
}

const HiddenCloseButtonSuperHack = styled.div`
  width: 5px;
  height: 5px;
  background-color: transparent;
`;

const IconContent = styled(Content)`
  display: grid;
  grid-template-columns: 70px 2fr;
  align-items: flex-start;
`;

const Text = styled.section`
  text-align: left;
  p {
    margin-bottom: 0;
  }
  a {
    color: ${colors.grey};
    font-size: 1rem;
  }
`;
