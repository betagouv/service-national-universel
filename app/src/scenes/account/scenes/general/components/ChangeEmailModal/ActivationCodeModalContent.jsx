import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import api from "@/services/api";
import { capture } from "@/sentry";
import Modal from "@/components/ui/modals/Modal";
import Input from "@/components/forms/inputs/Input";
import InlineButton from "@/components/dsfr/ui/buttons/InlineButton";
import { setYoung } from "@/redux/auth/actions";
import plausibleEvent from "@/services/plausible";

const ActivationCodeModalContent = ({ onSuccess, onCancel, newEmail, openDidNotReceiveCodeModal, validationToken = "" }) => {
  const dispatch = useDispatch();

  const [error, setError] = useState("");
  const [emailValidationToken, setEmailValidationToken] = useState(validationToken);
  const [isLoading, setLoading] = useState(false);

  async function requestNewToken() {
    try {
      const { code, ok } = await api.get("/young/email-validation/token");
      if (!ok) {
        toastr.error(`Une erreur s'est produite : ${translate(code)}`, "");
      } else {
        toastr.success("Un nouveau code d'activation vous a été envoyé par e-mail", "", { timeOut: 6000 });
        setEmailValidationToken("");
        setError("");
      }
    } catch (e) {
      capture(e);
      toastr.error(`Une erreur s'est produite : ${translate(e.code)}`, "");
    }
  }

  async function onSubmit() {
    if (!emailValidationToken) {
      return setError("Merci d'entrer le code d'activation ");
    }
    try {
      setLoading(true);
      const { code, ok, user } = await api.post("/young/email-validation/new-email", { token_email_validation: emailValidationToken });
      if (!ok) {
        setError(`Une erreur s'est produite : ${translate(code)}`);
      }
      if (user) dispatch(setYoung(user));
      setError("");
      setEmailValidationToken("");
      setLoading(false);
      plausibleEvent("Successful email update");
      onSuccess();
    } catch (e) {
      capture(e);
      setError(`Une erreur s'est produite : ${translate(e.code)}`);
      setLoading(false);
    }
  }

  return (
    <>
      <Modal.Title>Entrer le code d’activation</Modal.Title>
      <Modal.Subtitle>
        <div className="md:text-center mb-3">
          Vous venez de recevoir un code d’activation sur la boîte mail de <strong className="text-gray-900">{newEmail}</strong>
        </div>
      </Modal.Subtitle>
      <Input label="Code d'activation reçu par email" name="email" onChange={setEmailValidationToken} error={error} value={emailValidationToken} />
      <InlineButton
        className={`text-sm font-medium ${error ? "text-red-500 hover:text-red-700" : "text-gray-500 hover:text-gray-700"}`}
        onClick={error ? requestNewToken : openDidNotReceiveCodeModal}>
        {error ? "Recevoir un nouveau code d’activation" : "Je n'ai rien reçu"}
      </InlineButton>
      <Modal.Buttons onCancel={onCancel} cancelText="Annuler" onConfirm={onSubmit} confirmText="Valider" disabled={isLoading} />
    </>
  );
};

export default ActivationCodeModalContent;
