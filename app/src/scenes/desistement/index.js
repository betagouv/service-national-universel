import React, { useState } from "react";

import { ModalContainer, Content, Footer } from "../../components/modals/Modal";
import ModalButton from "../../components/buttons/ModalButton";
import { WITHRAWN_REASONS, YOUNG_STATUS } from "../../utils";
import RoundWarning from "../../assets/RoundWarning";

export default function Desistement({ onChange, onConfirm }) {
  const [withdrawnMessage, setWithdrawnMessage] = useState();
  const [withdrawnReason, setWithdrawnReason] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    //onConfirm(YOUNG_STATUS.WITHDRAWN, values);
    onConfirm({ withdrawnReason, withdrawnMessage });
  };

  return (
    <div>
      <ModalContainer>
        <RoundWarning style={{ marginBottom: "1.5rem" }} />
        <Content>
          <h1>Vous souhaitez vous désister ?</h1>
          <p style={{ marginBottom: "1rem" }}>Précisez la raison de votre désistement</p>
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
              placeholder={"Précisez en quelques mots la raisons de votre désistement" + (withdrawnReason === "other" ? " (obligatoire)" : " (facultatif)")}
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
    </div>
  );
}
