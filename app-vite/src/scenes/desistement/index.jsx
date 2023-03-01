import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory, Link } from "react-router-dom";

import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, translate, WITHRAWN_REASONS } from "../../utils";
import api from "../../services/api";
import { setYoung } from "../../redux/auth/actions";
import ModalButton from "../../components/buttons/ModalButton";
import RoundWarning from "../../assets/RoundWarning";
import { supportURL } from "../../config.js";

export default function Desistement() {
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);
  const [confirm, setConfirm] = useState({ state: false, onConfirm: () => {} });
  const [status, setStatus] = useState(YOUNG_STATUS.WITHDRAWN);
  const [stopSNU, setStopSNU] = useState("désistement");
  const [title, setTitle] = useState("Vous souhaitez vous désister ?");

  // in /inscription/desistement, we do not check if the young is logged in
  // so we need to double check here
  if (!young) {
    history.push("/");
    return null;
  }

  const mandatoryPhasesDone = young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
  const dispatch = useDispatch();

  useEffect(() => {
    if ([YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status)) {
      setStopSNU("abandon");
      setStatus(YOUNG_STATUS.ABANDONED);
      setTitle("Vous souhaitez abandonner votre inscription ?");
    }
  }, []);

  const onConfirm = async (status, values) => {
    young.historic.push({
      phase: young.phase,
      userName: `${young.firstName} ${young.lastName}`,
      userId: young._id,
      status,
      note: values ? WITHRAWN_REASONS.find((r) => r.value === values?.withdrawnReason)?.label + " " + values?.withdrawnMessage : null,
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
    history.push("/");
    dispatch(setYoung(null));
  }

  return (
    <>
      {mandatoryPhasesDone ? (
        <ComponentConfirm
          title="Suppression du compte SNU"
          message="Vous êtes sur le point de supprimer votre compte. Vous serez immédiatement déconnecté(e). Souhaitez-vous réellement supprimer votre compte ?"
          onConfirm={async () => {
            await onConfirm(YOUNG_STATUS.DELETED);
          }}
        />
      ) : confirm.state ? (
        <ComponentConfirm
          title="Êtes-vous sûr ?"
          message={<p>Vous vous apprêtez à quitter votre parcours SNU. Cette action est irréversible, souhaitez-vous confirmer cette action ?</p>}
          onConfirm={async () => {
            await confirm.onConfirm();
          }}
        />
      ) : (
        <ComponentWithdrawn
          title={title}
          message={
            <>
              <p>Précisez la raison de votre {stopSNU}.</p>
              {/2022/.test(young.cohort) ? (
                <p>
                  Si vous souhaitez changer vos dates de séjour, merci de consulter l&apos;
                  <a href={`${supportURL}/base-de-connaissance/je-souhaite-changer-les-dates-de-mon-sejour`} className="button underline" target="_blank" rel="noreferrer">
                    article suivant
                  </a>
                  .
                </p>
              ) : null}
            </>
          }
          placeholder={`Précisez en quelques mots la raison de votre ${stopSNU} (obligatoire)`}
          onConfirm={(values) => {
            setConfirm({ state: true, onConfirm: () => onConfirm(status, values) });
          }}
        />
      )}
    </>
  );
}

function ComponentConfirm({ title, message, onConfirm, confirmText = "Confirmer", cancelText = "Annuler" }) {
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    await onConfirm();
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
          {!sending ? (
            <ModalButton>
              <Link to="/" style={{ color: "rgb(81, 69, 205)", width: "100%" }}>
                {cancelText}
              </Link>
            </ModalButton>
          ) : null}
        </footer>
      </Container>
    </div>
  );
}

function ComponentWithdrawn({ title, message, onConfirm, placeholder = "Votre message..." }) {
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
            <textarea className="form-control" placeholder={placeholder} rows="8" value={withdrawnMessage} onChange={(e) => setWithdrawnMessage(e.target.value)} />
          ) : null}
        </Content>
        <footer>
          <ModalButton loading={sending} disabled={sending || !withdrawnReason || !withdrawnMessage} onClick={submit} primary>
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

const Container = styled.div`
  margin: 1rem auto;
  max-width: 900px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-top: 2rem;
  border-radius: 1rem;
  overflow: hidden;
  footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 50%;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  padding-top: 0;
  h1 {
    font-size: 2rem;
    color: #000;
  }
  p {
    font-size: 1rem;
    margin: 0;
    color: #6e757c;
  }
  textarea {
    padding: 1rem;
    line-height: 1.5;
    border-radius: 0.5rem;
    border: 1px solid #ced4da;
    min-width: 100%;
    margin-bottom: 2rem;
  }
`;
