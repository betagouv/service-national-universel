import React from "react";
import Modal from "../ui/modals/Modal";
import { IoWarning } from "react-icons/io5";
import ButtonLight from "../ui/buttons/ButtonLight";

const ModalDelayed = ({ isOpen, onClose, bus }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl bg-white rounded-xl p-6">
      <div className="text-sm text-gray-700 leading-5 space-y-4">
        <IoWarning className="w-10 h-10 mx-auto text-gray-400" />
        <h4 className="flex text-center">Retard prévu sur votre ligne de bus</h4>
        <p>Votre départ en séjour approche et les équipes encadrantes ont hâte de vous accueillir au sein de votre centre d’affectation !</p>
        <p>
          <strong>Cependant</strong>, suite à un imprévus, votre ligne de bus affiche un léger retard{" "}
          {bus.delayedForth === "true" && bus.delayedBack === "true" ? "à l'Aller et au Retour" : bus.delayedForth === "true" ? "à l'Aller" : "au Retour"}. Toutefois le rendez vous
          de votre convocation est maintenu. Nous mettons tout en œuvre pour veiller à ce que le transport vers votre centre se déroule dans les meilleures conditions.
        </p>
        <p>Pour toute précision, merci de vous rapprocher du contact inscrit sur votre convocation.</p>
      </div>
      <div className="mt-12">
        <ButtonLight className="w-full" onClick={onClose}>
          Fermer
        </ButtonLight>
      </div>
    </Modal>
  );
};

export default ModalDelayed;
