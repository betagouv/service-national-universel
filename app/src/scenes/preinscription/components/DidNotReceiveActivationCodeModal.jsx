import React, { useState, useEffect } from "react";
import Modal from "../../../components/ui/modals/Modal";
import ArrowRightBlue from "../../../assets/icons/ArrowRightBlue";
import InformationSquare from "../../../assets/icons/InformationSquare";
import PrimaryButton from "../../../components/ui/dsfr/PrimaryButton";
import InlinButton from "./InlineButton";
import Cross from "../../../assets/icons/Cross";

const DidNotReceiveActivationCodeModal = ({ onClose, isOpen }) => {
  return (
    <Modal className="w-full bg-white md:w-[540px]" isOpen={isOpen} onClose={() => {}}>
      <div className="flex justify-end text-[#000091]">
        <button onClick={() => {}} className="flex p-3 items-center">
          <span className="text-sm">Fermer</span>
          <Cross className="ml-1 mt-[2px]" />
        </button>
      </div>
      <div className="p-4 md:p-6 !pt-0">
        <h1 className="mb-3 text-2xl font-semibold text-[#161616]">
          <ArrowRightBlue className="inline mr-2" /> Je n'ai rien reçu le code d'activation par e-mail
        </h1>
        <span className="text-[#3A3A3A]">Si vous ne recevez pas le mail, nous vous invitons à vérifier que :</span>
        <ul className="mt-4 list-none text-[#0063CB] flex flex-col gap-1">
          <li>
            <InformationSquare className="inline mb-1 mr-1" />
            L'adresse e-mail que vous utilisez est bien celle que vous avez renseigné
            <InlinButton className="ml-1 text-[#0063CB]" onClick={() => {}}>
              Modifier mon adresse e-mail
            </InlinButton>
          </li>
          <li>
            <InformationSquare className="inline mb-1 mr-1" />
            Le mail ne se trouve pas dans vos spam
          </li>
          <li>
            <InformationSquare className="inline mb-1 mr-1" />
            L'adresse e-mail no_reply-mailauto@snu.gouv.fr ne fait pas partie des adresses indésirables de votre boîte mail
          </li>
          <li>
            <InformationSquare className="inline mb-1 mr-1" />
            Votre boite de réception n'est pas saturée
          </li>
        </ul>
      </div>
      <hr className="h-px border-0 md:bg-gray-200" />
      <div className="p-4 flex justify-end">
        <PrimaryButton onClick={() => {}}>Recevoir un nouveau code d’activation</PrimaryButton>
      </div>
    </Modal>
  );
};

export default DidNotReceiveActivationCodeModal;
