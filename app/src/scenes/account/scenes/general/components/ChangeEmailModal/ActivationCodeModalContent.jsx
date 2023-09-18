import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { translate } from "snu-lib";
import queryString from "query-string";
import api from "@/services/api";
import { capture } from "@/sentry";
import Modal from "@/components/ui/modals/Modal";
import Input from "@/components/forms/inputs/Input";
import InlineButton from "@/components/dsfr/ui/buttons/InlineButton";
import { setYoung } from "@/redux/auth/actions";
import plausibleEvent from "@/services/plausible";

const ActivationCodeModalContent = ({ onSuccess, onCancel, newEmail, openDidNotReceiveCodeModal }) => {
  const dispatch = useDispatch();
  const { search } = useLocation();
  const { token } = queryString.parse(search);
  const [error, setError] = useState("");
  const [emailValidationToken, setEmailValidationToken] = useState(token || "");
  const [isLoading, setLoading] = useState(false);

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
      {/* refacto inline button gray en props */}
      <InlineButton className="text-gray-500 hover:text-gray-700 text-sm font-medium" onClick={openDidNotReceiveCodeModal}>
        Je n'ai rien reçu
      </InlineButton>
      <Modal.Buttons onCancel={onCancel} cancelText="Annuler" onConfirm={onSubmit} confirmText="Valider" disabled={isLoading} />
    </>
  );
};

export default ActivationCodeModalContent;
