import React, { useEffect, useState } from "react";
import { Modal } from "reactstrap";
import styled from "styled-components";

import api from "../../services/api";

import { toastr } from "react-redux-toastr";
import LoadingButton from "../buttons/LoadingButton";

export default ({ value, onChange, onSend }) => {
  const [message, setMessage] = useState();
  const [sending, setSending] = useState(false);

  if (!value) return <div />;

  const send = async () => {
    setSending(true);
    // await api.post(`/referent/email/correction/${value._id}`, { message, subject: "Demande de correction" });
    // toastr.success("Email envoyé !");
    onSend(message);
  };

  return (
    <Modal isOpen={true} toggle={onChange}>
      <ModalContainer>
        <img src={require("../../assets/close.svg")} height={10} onClick={onChange} />
        <h1>Veuillez précisez le motif du désistement ci-dessous avant de valider.</h1>
        <textarea rows="6" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message..." />
        <LoadingButton disabled={sending || !message} onClick={send}>
          Valider le désistement
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
