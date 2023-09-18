import React from "react";
import { BsInfoSquareFill } from "react-icons/bs";
import { translate } from "snu-lib";
import { toastr } from "react-redux-toastr";
import Modal from "@/components/ui/modals/Modal";
import InlineButton from "@/components/dsfr/ui/buttons/InlineButton";
import api from "@/services/api";
import { capture } from "@/sentry";

const DidNotReceiveActivationCodeModalContent = ({ onConfirm, modifiyEmail }) => {
  async function requestNewToken() {
    try {
      const { code, ok } = await api.get("/young/email-validation/token");
      if (!ok) {
        toastr.success(`Une erreur s'est produite : ${translate(code)}`, "");
      } else {
        toastr.success("Un nouveau code d'activation vous a été envoyé par e-mail", "", { timeOut: 6000 });
        onConfirm();
      }
    } catch (e) {
      capture(e);
      toastr.error(`Une erreur s'est produite : ${translate(e.code)}`, "");
    }
  }

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
          <InlineButton className="ml-1 text-xs text-[#0063CB]" onClick={modifiyEmail}>
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
      <Modal.Buttons onCancel={onConfirm} cancelText="J'ai compris" onConfirm={requestNewToken} confirmText="Recevoir un nouveau code" />
    </>
  );
};

export default DidNotReceiveActivationCodeModalContent;
