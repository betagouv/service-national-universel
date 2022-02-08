import React from "react";
import { Modal } from "reactstrap";

import { ModalContainer, Content, Footer, Header } from "./Modal";
import ModalButton from "../buttons/ModalButton";
import CloseSvg from "../../assets/Close";

export default function ModalInProgress({ onChange }) {
  return (
    <Modal centered isOpen={true} toggle={onChange}>
      <ModalContainer>
        <CloseSvg className="close-icon" height={10} onClick={onChange} />
        <Header>avertissement</Header>
        <Content>
          <h1>Les inscriptions sont closes</h1>
          <p>Vous ne pouvez plus accèder au formulaire d&apos;inscription.</p>
        </Content>
        <Footer>
          <ModalButton color="#5245cc" onClick={onChange}>
            OK
          </ModalButton>
        </Footer>
      </ModalContainer>
    </Modal>
  );
}
