import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Container, Content } from "./Container";
import ModalButton from "../../../components/buttons/ModalButton";
import { WITHRAWN_REASONS } from "../../../utils";
import RoundWarning from "../../../assets/RoundWarning";

export default function ComponentWithdrawn({ title, message, onConfirm, placeholder = "Votre message..." }) {
  const [withdrawnMessage, setWithdrawnMessage] = useState();
  const [withdrawnReason, setWithdrawnReason] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    onConfirm({ withdrawnReason, withdrawnMessage });
  };

  return (
    <div>
      <Container>
        <RoundWarning style={{ marginBottom: "1.5rem" }} />
        <Content>
          <h1>{title}</h1>
          <p style={{ marginBottom: "1rem" }}>{message}</p>
          <select style={{ marginBottom: "1rem" }} className="form-control" value={withdrawnReason} onChange={(e) => setWithdrawnReason(e.target.value)}>
            <option disabled value="" label="Choisir">
              Choisir
            </option>
            {WITHRAWN_REASONS.map((reason) => (
              <option key={reason.value} value={reason.value} label={reason.label}>
                {reason.label}
              </option>
            ))}
          </select>
          {withdrawnReason ? (
            <textarea
              className="form-control"
              placeholder={placeholder + (withdrawnReason === "other" ? " (obligatoire)" : " (facultatif)")}
              rows="8"
              value={withdrawnMessage}
              onChange={(e) => setWithdrawnMessage(e.target.value)}
            />
          ) : null}
        </Content>
        <footer>
          <ModalButton loading={sending} disabled={sending || !withdrawnReason || (withdrawnReason === "other" && !withdrawnMessage)} onClick={submit} primary>
            Confirmer
          </ModalButton>
          <ModalButton>
            <Link to="/" style={{ color: "rgb(81, 69, 205)", width: "100%" }}>
              Annuler
            </Link>
          </ModalButton>
        </footer>
      </Container>
    </div>
  );
}
