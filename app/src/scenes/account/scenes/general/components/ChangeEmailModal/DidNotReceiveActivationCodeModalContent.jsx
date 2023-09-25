import React from "react";
import { translate } from "snu-lib";
import { toastr } from "react-redux-toastr";
import Modal from "@/components/ui/modals/Modal";
import api from "@/services/api";
import { capture } from "@/sentry";
import DidNotReceiveActivationReasons from "../DidNotReceiveActivationReasons";

const DidNotReceiveActivationCodeModalContent = ({ onConfirm, modifiyEmail }) => {
  async function requestNewToken() {
    try {
      const { code, ok } = await api.get("/young/email-validation/token");
      if (!ok) {
        toastr.error(`Une erreur s'est produite : ${translate(code)}`, "");
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
        <div className="md:text-center mb-3">Si vous ne recevez pas le code d’activation, nous vous invitons à vérifier que :</div>
      </Modal.Subtitle>
      <DidNotReceiveActivationReasons modifiyEmail={modifiyEmail} className="text-xs" />
      <Modal.Buttons onCancel={onConfirm} cancelText="J'ai compris" onConfirm={requestNewToken} confirmText="Recevoir un nouveau code" />
    </>
  );
};

export default DidNotReceiveActivationCodeModalContent;
