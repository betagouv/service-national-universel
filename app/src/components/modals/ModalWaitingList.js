import React from "react";
import { Modal } from "reactstrap";
import { ModalContainer, Content, Footer, Header } from "./Modal";
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
