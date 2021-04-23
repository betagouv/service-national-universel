import React from "react";
import { Modal } from "reactstrap";
import styled from "styled-components";

import ModalButton from "../buttons/ModalButton";

export default ({ onChange, onValidate, callback }) => {
  return (
    <Modal isOpen={true} toggle={onChange}>
      <ModalContainer>
        <img src={require("../../assets/close.svg")} height={10} onClick={onChange} />
        <Header>attention</Header>
        <Content>
          <h1>Jauge de candidats atteinte</h1>
          <p>
            Attention, vous avez atteint la jauge, merci de placer le candidat sur <b>liste complémentaire</b> ou de vous rapprocher de votre coordinateur régional avant de valider
            la candidature.
          </p>
        </Content>
        <Footer>
          <ModalButton color="#5245cc" onClick={callback}>
            Placer en liste complémentaire
          </ModalButton>
          <ModalButton onClick={onValidate}>Valider</ModalButton>
          <p onClick={onChange}>Annuler</p>
        </Footer>
      </ModalContainer>
    </Modal>
  );
};

const ModalContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #fff;
  padding-top: 2rem;
  border-radius: 1rem;
  overflow: hidden;
  img {
    position: absolute;
    right: 0;
    top: 0;
    margin: 1rem;
    cursor: pointer;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #ef4036;
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
    font-size: 1.4rem;
    color: #000;
  }
  p {
    font-size: 1rem;
    margin: 0;
    color: #6e757c;
  }
`;

const Footer = styled.div`
  background-color: #f3f3f3;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  > * {
    margin: 0.3rem 0;
  }
  p {
    color: #696969;
    font-size: 0.8rem;
    font-weight: 400;
    :hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
`;
