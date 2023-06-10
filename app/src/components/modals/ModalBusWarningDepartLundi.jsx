import React from "react";
import Modal from "../ui/modals/Modal";
import { IoWarning } from "react-icons/io5";
import ButtonLight from "../ui/buttons/ButtonLight";

const ModalBusWarningDepartLundi = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-[512px] bg-white rounded-xl p-6">
      <div className="flex flex-col gap-2">
        <IoWarning className="w-10 h-10 mx-auto text-gray-400" />
        <h4 className="flex text-center">Changement de date de votre départ en séjour</h4>
      </div>
      <p className="text-sm text-gray-500 leading-5 mt-4 mx-2">
        Votre départ en séjour approche et les équipes encadrantes ont hâte de vous accueillir au sein de votre centre d&apos;affectation !<br />
        <br />
        <strong>Cependant, en raison de difficultés de transport, votre départ est décalé à lundi.</strong>
        <br />
        <br />
        Nous revenons vers vous au plus vite pour vous préciser votre nouvel horaire de départ.
        <br />
        <br />
        Nous mettons tout en oeuvre pour veiller à ce que le transport vers votre centre se déroule dans les meilleures conditions.
        <br />
        <br />
        Pour toute demande de renseignements, nous vous invitons à nous contact via le centre d&apos;aide.
      </p>
      <div className="mt-12">
        <ButtonLight className="w-full" onClick={onClose}>
          Fermer
        </ButtonLight>
      </div>
    </Modal>
  );
};

export default ModalBusWarningDepartLundi;
