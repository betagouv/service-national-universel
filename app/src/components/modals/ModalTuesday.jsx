import React from "react";
import Modal from "../ui/modals/Modal";
import { IoWarning } from "react-icons/io5";
import ButtonLight from "../ui/buttons/ButtonLight";

const ModalTuesday = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl bg-white rounded-xl p-6">
      <div className="text-sm text-gray-700 leading-5 space-y-4">
        <IoWarning className="w-10 h-10 mx-auto text-gray-400" />
        <h4 className="flex text-center">Départ en séjour reporté au mardi 13 juin</h4>
        <p>
          <strong>En raison de difficultés de transport, nous sommes malheureusement contraints de décaler votre départ au mardi 13 juin.</strong>
        </p>
        <p>Toutes les équipes du Service National Universel sont mobilisées pour veiller à ce que le transport vers votre centre se déroule dans les meilleures conditions.</p>
        <p>
          Conscients des difficultés logistiques que cette contrainte de dernière minute peut causer dans votre organisation, nous vous prions de nous excuser pour ce changement.
        </p>
        <p>Nous reviendrons vers vous au plus vite pour vous préciser votre nouvel horaire de départ.</p>
        <p>Nous vous remercions d'avance pour votre compréhension.</p>
      </div>
      <div className="mt-12">
        <ButtonLight className="w-full" onClick={onClose}>
          Fermer
        </ButtonLight>
      </div>
    </Modal>
  );
};

export default ModalTuesday;
