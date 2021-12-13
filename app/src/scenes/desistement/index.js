import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";

import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, translate, WITHRAWN_REASONS } from "../../utils";
import ModalConfirm from "../../components/modals/ModalConfirm";
import ModalWithdrawn from "../../components/modals/ModalWithdrawn";
import api from "../../services/api";
import { setYoung } from "../../redux/auth/actions";

import { ModalContainer, Content, Footer } from "../../components/modals/Modal";
import ModalButton from "../../components/buttons/ModalButton";
import RoundWarning from "../../assets/RoundWarning";

const DeleteAccountButton = ({ young }) => {
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalWithdrawn, setModalWithdrawn] = useState({ isOpen: false, onConfirm: null });
  const mandatoryPhasesDone = young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
  const getLabel = () => (mandatoryPhasesDone ? "Supprimer mon compte" : "Se désister du SNU");
  const dispatch = useDispatch();

  const onConfirm = async (status, values) => {
    young.historic.push({
      phase: young.phase,
      userName: `${young.firstName} ${young.lastName}`,
      userId: young._id,
      status,
      note: WITHRAWN_REASONS.find((r) => r.value === values.withdrawnReason)?.label + " " + values.withdrawnMessage,
    });
    try {
      const { ok, code } = await api.put(`/young`, { ...values, status, lastStatusAt: Date.now() });
      if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande :", translate(code));
      logout();
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  };

  async function logout() {
    await api.post(`/young/logout`);
    dispatch(setYoung(null));
  }

  return (
    <>
      <div onClick={mandatoryPhasesDone ? () => setModal({ isOpen: true }) : () => setModalWithdrawn({ isOpen: true })}>{getLabel()}</div>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title="Suppression du compte SNU"
        message="Vous êtes sur le point de supprimer votre compte. Vous serez immédiatement déconnecté(e). Souhaitez-vous réellement supprimer votre compte ?"
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          onConfirm(YOUNG_STATUS.DELETED);
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalWithdrawn
        isOpen={modalWithdrawn.isOpen}
        title="Vous souhaitez vous désister ?"
        message="Précisez la raison de votre désistement"
        placeholder="Précisez en quelques mots la raisons de votre désistement"
        onChange={() => setModalWithdrawn({ isOpen: false, data: null })}
        onConfirm={(values) => {
          onConfirm(YOUNG_STATUS.WITHDRAWN, values);
          setModalWithdrawn({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
};

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
