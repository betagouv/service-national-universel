import React, { useState } from "react";
import { translate } from "snu-lib";
import { capture } from "@/sentry";
import api from "@/services/api";
import Modal from "@/components/ui/modals/Modal";
import InputPassword from "@/components/forms/inputs/InputPassword";

const PasswordModalContent = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);

  const checkPassword = async (password) => {
    if (!password) {
      return setError("Merci d'entrer le mot de passe ");
    }
    try {
      setLoading(true);
      const { ok, code } = await api.post(`/young/check_password`, { password });
      if (!ok) return setError(translate(code));
      setError("");
      setPassword("");
      return onSuccess(password);
    } catch (e) {
      capture(e);
      setError(translate(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal.Title>Saisir votre mot de passe de connexion</Modal.Title>
      <Modal.Subtitle>
        <div className="md:text-center mb-3">Pour sécuriser votre demande de changement d'adresse email, veuillez saisir votre mot de passe.</div>
      </Modal.Subtitle>
      <InputPassword label="Mot de passe" name="password" onChange={setPassword} error={error} value={password} />
      <Modal.Buttons onCancel={onCancel} cancelText="Annuler" onConfirm={() => checkPassword(password)} confirmText="Continuer" disabled={isLoading} />
    </>
  );
};

export default PasswordModalContent;
