import React from "react";
import { Modal } from "reactstrap";
import { ModalContainer } from "./Modal";
import CloseSvg from "../../assets/Close";

export default function ModalForm({ isOpen, showHeaderText = true, headerText, children, showCloseIcon = true, onCancel, classNameModal = "" }) {
  return (
    <Modal className={classNameModal} centered isOpen={isOpen} toggle={onCancel}>
      <ModalContainer>
        {showCloseIcon ? <CloseSvg className="close-icon" height={10} onClick={onCancel} /> : null}
        {showHeaderText ? <div className="align-center flex text-xl font-medium text-black">{headerText}</div> : null}
        {children}
      </ModalContainer>
    </Modal>
  );
}
