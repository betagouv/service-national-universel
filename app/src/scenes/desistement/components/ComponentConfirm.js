import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Container, Content } from "./Container";
import ModalButton from "../../../components/buttons/ModalButton";
import RoundWarning from "../../../assets/RoundWarning";

export default function ComponentConfirm({ title, message, onConfirm, confirmText = "Confirmer", cancelText = "Annuler" }) {
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    onConfirm();
    setSending(false);
  };

  return (
    <div>
      <Container>
        <RoundWarning style={{ marginBottom: "1.5rem" }} />
        <Content>
          <h1>{title}</h1>
          <p>{message}</p>
        </Content>
        <footer>
          <ModalButton loading={sending} disabled={sending} onClick={submit} primary>
            {confirmText}
          </ModalButton>
          <ModalButton>
            <Link to="/" style={{ color: "rgb(81, 69, 205)", width: "100%" }}>
              {cancelText}
            </Link>
          </ModalButton>
        </footer>
      </Container>
    </div>
  );
}
