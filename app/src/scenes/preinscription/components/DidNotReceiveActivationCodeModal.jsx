import React from "react";
import Modal from "../../../components/ui/modals/Modal";
import ArrowRightBlue from "../../../assets/icons/ArrowRightBlue";
import { HiX } from "react-icons/hi";
import PrimaryButton from "../../../components/dsfr/ui/buttons/PrimaryButton";
import DidNotReceiveActivationReasons from "@/scenes/account/scenes/general/components/DidNotReceiveActivationReasons";

const DidNotReceiveActivationCodeModal = ({ onClose, isOpen, onRequestNewToken, onRequestEmailModification }) => {
  return (
    <Modal className="w-full bg-white md:w-[540px]" isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-end text-[#000091]">
        <button onClick={onClose} className="flex p-3 items-center">
          <span className="text-sm">Fermer</span>
          <HiX className="ml-1 mt-[2px]" />
        </button>
      </div>
      <div className="p-4 md:p-6 !pt-0">
        <h1 className="mb-3 text-2xl font-semibold text-[#161616]">
          <ArrowRightBlue className="inline mr-2" /> Je n'ai pas reçu le code d'activation par e-mail
        </h1>
        <span className="text-[#3A3A3A]">Si vous ne recevez pas le mail, nous vous invitons à vérifier que :</span>
        <DidNotReceiveActivationReasons modifiyEmail={onRequestEmailModification} />
      </div>
      <hr className="h-px border-0 md:bg-gray-200" />
      <div className="p-4 flex justify-end">
        <PrimaryButton onClick={onRequestNewToken}>Recevoir un nouveau code d’activation</PrimaryButton>
      </div>
    </Modal>
  );
};

export default DidNotReceiveActivationCodeModal;
