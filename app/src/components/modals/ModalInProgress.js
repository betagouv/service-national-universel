import React, { useState } from "react";
import { Modal } from "reactstrap";
import validator from "validator";
import { toastr } from "react-redux-toastr";

import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";

export default ({ onChange, cb }) => {
  return (
    <Modal isOpen={true} toggle={onChange}>
      <ModalContainer>
        <img src={require("../../assets/close.svg")} height={10} onClick={onChange} />
        <Header>avertissement</Header>
        <Content>
          <h1>Les inscriptions sont closes</h1>
          <p>Vous ne pouvez plus accèder au formulaire d'inscription.</p>
        </Content>
        <Footer>
          <ModalButton color="#5245cc" onClick={onChange}>
            OK
          </ModalButton>
        </Footer>
      </ModalContainer>
    </Modal>
  );
};
