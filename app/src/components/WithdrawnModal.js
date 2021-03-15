import React, { useState } from "react";
import { Modal } from "reactstrap";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";

import LoadingButton from "../components/buttons/LoadingButton";
import { setYoung } from "../redux/auth/actions";
import api from "../services/api";

export default ({ value, onChange, status }) => {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState();
  const dispatch = useDispatch();

  if (!value) return <div />;

  const send = async () => {
    if (!confirm("Êtes-vous certain(e) de vouloir effectuer cette démarche ?")) return;
    setSending(true);
    setStatus(message);
    onChange();
  };

  const setStatus = async (note) => {
    value.historic.push({ phase: value.phase, userName: `${value.firstName} ${value.lastName}`, userId: value._id, status, note });
    value.status = status;
    if (note) value.withdrawnMessage = note;
    value.lastStatusAt = Date.now();
    try {
      const { ok, code, data } = await api.put(`/young`, value);
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

  const render = () => {
    return status === "WITHDRAWN" ? (
      <>
        <h1>Veuillez précisez le motif de votre désistement ci-dessous avant de valider.</h1>
        <textarea rows="6" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Je souhaite me désister du Service National Universel car..." />
        <LoadingButton disabled={sending || !message} onClick={send}>
          Valider mon désistement
        </LoadingButton>
      </>
    ) : (
      <>
        <h1>Vous êtes sur le point de supprimer votre compte. Vous serez immédiatement déconnecté(e). Souhaitez-vous réellement supprimer votre compte ?</h1>
        <LoadingButton disabled={sending} onClick={send}>
          Supprimer mon compte
        </LoadingButton>
      </>
    );
  };

  return (
    <Modal isOpen={true} toggle={onChange} style={{}}>
      <ModalContainer>
        <img src={require("../assets/close.svg")} height={10} onClick={onChange} />
        {render()}
        <CancelButton onClick={onChange}>Annuler</CancelButton>
      </ModalContainer>
    </Modal>
  );
};

const ModalContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2.5rem;
  flex-direction: column;
  img {
    position: absolute;
    right: 0;
    top: 0;
    margin: 1rem;
    cursor: pointer;
  }
  h1 {
    font-size: 1.2rem;
    text-align: center;
    margin: 1rem 0;
  }
  h3 {
    margin: 1rem 0;
    text-align: center;
    color: #929292;
    font-size: 1rem;
    font-weight: 300;
  }
  textarea {
    margin: 1rem 0;
    padding: 1rem;
    line-height: 1.5;
    border-radius: 0.5rem;
    border: 1px solid #ccc;
    min-width: 100%;
  }
`;

const CancelButton = styled.div`
  cursor: pointer;
  background-color: transparent;
  color: #777;
  text-transform: uppercase;
  font-size: 0.8rem;
  margin-top: 1rem;
  :hover {
    color: #111;
  }
`;
