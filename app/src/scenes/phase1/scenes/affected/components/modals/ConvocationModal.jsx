import { ModalContainer } from "@/components/modals/Modal";
import React from "react";
import { Modal } from "reactstrap";
import Convocation from "../Convocation";

export default function ConvocationModal({ isOpen, setIsOpen, center, meetingPoint, departureDate, returnDate }) {
  return (
    <Modal isOpen={isOpen} toggle={() => setIsOpen(false)} size="lg">
      <ModalContainer>
        <button className="close" onClick={() => setIsOpen(false)}>
          <span aria-hidden="true">&times;</span>
        </button>
        <Convocation center={center} meetingPoint={meetingPoint} departureDate={departureDate} returnDate={returnDate} />
      </ModalContainer>
    </Modal>
  );
}
