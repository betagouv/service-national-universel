import React from "react";
import { Modal } from "reactstrap";
import { ModalContainer } from "./Modal";
import CloseSvg from "../../assets/Close";

export default function ModalForm({ isOpen, showHeaderText = true, headerText, children, onCancel, classNameModal = "" }) {
  return (
    <Modal className={classNameModal} centered isOpen={isOpen} toggle={onCancel}>
      <ModalContainer>
        <CloseSvg className="close-icon" height={10} onClick={onCancel} />
        {showHeaderText ? <div className="flex align-center text-xl text-black font-medium">{headerText}</div> : null}
        {children}
      </ModalContainer>
    </Modal>
  );
}
