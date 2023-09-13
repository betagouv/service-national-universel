import React from "react";
import { BsInfoSquareFill } from "react-icons/bs";
import Modal from "@/components/ui/modals/Modal";
import InlineButton from "@/components/dsfr/ui/buttons/InlineButton";

const DidNotReceiveActivationCodeModalContent = ({ onConfirm, onCancel }) => {
  return (
    <>
      <Modal.Title>Je n'ai rien reçu</Modal.Title>
      <Modal.Subtitle>
        {/* @todo md:text-center par default? */}
        <div className="md:text-center mb-3">Si vous ne recevez pas le code d’activation, nous vous invitons à vérifier que :</div>
      </Modal.Subtitle>
      {/* @todo mutualise list */}
      <ul className="mt-4 list-none text-[#0063CB] text-xs flex flex-col gap-1">
        <li>
          <BsInfoSquareFill className="inline mb-1 mr-1" />
          L'adresse e-mail que vous utilisez est bien celle que vous avez renseigné
          <InlineButton className="ml-1 text-xs text-[#0063CB]" onClick={() => {}}>
            Modifier mon adresse e-mail
          </InlineButton>
        </li>
        <li>
          <BsInfoSquareFill className="inline mb-1 mr-1" />
          Le mail ne se trouve pas dans vos spam
        </li>
        <li>
          <BsInfoSquareFill className="inline mb-1 mr-1" />
          L'adresse e-mail no_reply-mailauto@snu.gouv.fr ne fait pas partie des adresses indésirables de votre boîte mail
        </li>
        <li>
          <BsInfoSquareFill className="inline mb-1 mr-1" />
          Votre boite de réception n'est pas saturée
        </li>
      </ul>
      <Modal.Buttons onCancel={onCancel} cancelText="J'ai compris" onConfirm={() => onConfirm()} confirmText="Recevoir un nouveau code" />
    </>
  );
};

export default DidNotReceiveActivationCodeModalContent;
