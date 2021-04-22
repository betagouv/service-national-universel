import React from "react";
import { Modal } from "reactstrap";
import styled from "styled-components";

import ModalButton from "../buttons/ModalButton";

export default ({ onChange, cb }) => {
  return (
    <Modal isOpen={true} toggle={onChange}>
      <ModalContainer>
        <img src={require("../../assets/close.svg")} height={10} onClick={onChange} />
        <Header>avertissement</Header>
        <Content>
          <h1>Le SNU est victime de son succès dans votre département</h1>
          <p>
            Vous pouvez continuer votre inscription. Toutefois, vous serez placé sur <b>liste complémentaire</b>
          </p>
        </Content>
        <Footer>
          <ModalButton color="#5245cc" onClick={cb}>
            Continuer
          </ModalButton>
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
  input {
    text-align: center;
    min-width: 80%;
    max-width: 80%;
    border: #696969;
    border-radius: 10px;
    padding: 7px 30px;
  }
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
