import React, { useState } from "react";
import { Modal } from "reactstrap";

import { ModalContainer, Content, Footer } from "./Modal";
import ModalButton from "../buttons/ModalButton";
import { WITHRAWN_REASONS } from "../../utils";
import RoundWarning from "../../assets/RoundWarning";
import CloseSvg from "../../assets/Close";

export default function ModalWithdrawn({ isOpen, title, message, onChange, onConfirm, placeholder = "Votre message..." }) {
  const [withdrawnMessage, setWithdrawnMessage] = useState();
  const [withdrawnReason, setWithdrawnReason] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    onConfirm({ withdrawnReason, withdrawnMessage });
  };

  return (
    <Modal centered isOpen={isOpen} toggle={onChange}>
      <ModalContainer>
        <CloseSvg className="close-icon" height={10} onClick={onChange} />
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
        <Footer>
          <ModalButton loading={sending} disabled={sending || !withdrawnReason || (withdrawnReason === "other" && !withdrawnMessage)} onClick={submit} primary>
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
