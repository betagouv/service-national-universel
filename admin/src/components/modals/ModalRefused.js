import React, { useEffect, useState } from "react";
import { Modal } from "reactstrap";
import styled from "styled-components";

import api from "../../services/api";
import LoadingButton from "../buttons/LoadingButton";

import { toastr } from "react-redux-toastr";

export default ({ isOpen, value, onChange, onSend }) => {
  const [message, setMessage] = useState();
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setMessage(`Bonjour ${value.firstName} ${value.lastName},
Votre candidature au SNU a bien été étudiée par l'équipe de votre département.

Nous n'avons malheureusement pu donner suite à votre candidature au Service Nationale Universel édition 2021.
En voici les principales raisons :
-
-
-

Merci pour votre compréhension.
En vous souhaitant une excellente continuation.`);
  }, [value]);

  if (!value) return <div />;

  const send = async () => {
    setSending(true);
    await api.post(`/referent/email/refuse/${value._id}`, { message });
    toastr.success("Email envoyé !");
    onSend(message);
  };

  return (
    <Modal isOpen={isOpen} toggle={onChange}>
      <ModalContainer>
        <img src={require("../../assets/close.svg")} height={10} onClick={onChange} />
        <h1>Veuillez éditer le message ci-dessous pour préciser les raisons du refus avant de l'envoyer</h1>
        <h3>votre message</h3>
        <textarea rows="15" value={message} onChange={(e) => setMessage(e.target.value)} />
        <LoadingButton disabled={sending || !message} onClick={send}>
          Envoyer la notification
        </LoadingButton>
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
    font-size: 1.5rem;
    text-align: center;
  }
  h3 {
    color: #767676;
    font-size: 0.85rem;
    text-transform: uppercase;
    font-weight: 300;
  }
  textarea {
    padding: 1rem;
    line-height: 1.5;
    border-radius: 0.5rem;
    border: 1px solid #ccc;
    min-width: 100%;
    margin-bottom: 2rem;
  }
`;
