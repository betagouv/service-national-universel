import React from "react";
import { Modal } from "reactstrap";
import styled from "styled-components";

import { Link } from "react-router-dom";

export default ({ value, onChange }) => {
  if (!value) return <div />;

  const renderText = () => {
    if (value.isMilitaryPreparation === "true") return "Super, maintenant donne tes docs !";
    return "Votre candidature sera traitée dans les prochains jours par le responsable de la structure.";
  };

  const renderRedirect = () => {
    if (value.isMilitaryPreparation === "true")
      return (
        <Link to="/ma-preparation-militaire">
          <Button>Je renseigne mes documents</Button>
        </Link>
      );
    return (
      <Link to="/candidature">
        <Button>Classer mes missions</Button>
      </Link>
    );
  };

  return (
    <Modal isOpen={true} toggle={onChange} style={{}}>
      <ModalContainer>
        <img src={require("../../../assets/close.svg")} height={10} onClick={onChange} />
        <h1>Félications, votre candidature a bien été enregistrée.</h1>
        <h3>{renderText()}</h3>
        {/* todo: gerer classement candidature */}
        {/* <h2>Positionnez cette candidature dans vos préférences.</h2> */}
        {/* <Select></Select> */}
        {renderRedirect()}
        <CancelButton onClick={onChange}>Fermer</CancelButton>
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
  }
  h3 {
    margin: 1rem 0;
    text-align: center;
    color: #929292;
    font-size: 1rem;
    font-weight: 300;
  }
  textarea {
    padding: 1rem;
    line-height: 1.5;
    border-radius: 0.5rem;
    border: 1px solid #ccc;
    min-width: 100%;
  }
`;

const Button = styled.div`
  cursor: pointer;
  background-color: #31c48d;
  border-radius: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  color: #fff;
  font-size: 1rem;
  padding: 0.8rem 3rem;
  :hover {
    color: #fff;
    background-color: #0e9f6e;
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
