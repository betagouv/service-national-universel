import React, { useEffect, useState } from "react";
import { Modal } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";

import api from "../../services/api";
import LoadingButton from "../buttons/LoadingButton";
import { translate } from "../../utils";

export default ({ isOpen, value, onChange, onSend, structureId }) => {
  const [message, setMessage] = useState();
  const [sending, setSending] = useState(false);
  const [structure, setStructure] = useState();
  useEffect(() => {
    setMessage(`Bonjour ${value.youngFirstName} ${value.youngLastName},
Suite à votre candidature sur la mission ${value.missionName} proposée par ${
      structure?.name || "[nom de la structure]"
    }, nous ne pouvons donner suite à votre demande en raison de :

-
-
-

Nous vous invitons à candidater sur d'autres missions.

Cordialement
Les équipes du Service National Universel`);
  }, [value, structure]);

  useEffect(() => {
    if (!structureId) return setStructure(null);
    (async () => {
      const structureResponse = await api.get(`/structure/${structureId}`);
      if (!structureResponse.ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération de la structure", translate(structureResponse.code));
      }
      setStructure(structureResponse.data);
    })();
  }, [structureId]);

  if (!value || structure === undefined)
    return (
      <div>
        <i>Chargement</i>
      </div>
    );

  const send = async () => {
    setSending(true);
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
