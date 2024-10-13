import React from "react";
import Modal from "../ui/modals/Modal";
import { IoWarning } from "react-icons/io5";
import ButtonLight from "../ui/buttons/ButtonLight";
import { supportURL } from "@/config";

const ModalForm = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl bg-white rounded-xl p-6">
      <div className="text-sm text-gray-700 leading-5 space-y-4">
        <IoWarning className="w-10 h-10 mx-auto text-gray-400" />
        <p>Pendant la période estivale, les délais de traitement des demandes ont été rallongés.</p>
        <p>90% des demandes reçues par notre équipe trouvent leur réponse grâce à nos articles.</p>
        <p>
          Pour obtenir une réponse rapide, consultez notre{" "}
          <a href={`${supportURL}/base-de-connaissance`} target="_blank" rel="noopener noreferrer">
            <span style={{ color: "blue" }}>base de connaissance</span>
          </a>
          .
        </p>
      </div>
      <div className="mt-12">
        <ButtonLight className="w-full" onClick={onClose}>
          J’ai compris
        </ButtonLight>
      </div>
    </Modal>
  );
};

export default ModalForm;
