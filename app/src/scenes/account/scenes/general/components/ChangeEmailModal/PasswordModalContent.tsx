import React, { useState } from "react";
import { translate } from "snu-lib";
import { formatToActualTime } from "snu-lib";
import { capture } from "@/sentry";
import api from "@/services/api";
import Modal from "@/components/ui/modals/Modal";
import InputPassword from "@/components/forms/inputs/InputPassword";

interface PasswordModalContentProps {
  onSuccess: (password: string) => void;
  onCancel: () => void;
}

const PasswordModalContent: React.FC<PasswordModalContentProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setLoading] = useState<boolean>(false);

  const checkPassword = async (password: string): Promise<void> => {
    if (!password) {
      return setError("Merci d'entrer le mot de passe ");
    }
    try {
      setLoading(true);
      const { ok, code } = await api.post(`/young/check_password`, { password });
      setLoading(false);
      if (!ok) return setError(translate(code));
      setError("");
      setPassword("");

      return onSuccess(password);
    } catch (e: any) {
      setPassword("");
      setError(translate(e.code));
      if (e.code === "TOO_MANY_REQUESTS") {
        const date = formatToActualTime(e?.data?.nextLoginAttemptIn);
        setError(
          `Vous avez atteint le maximum de tentatives de connexion autorisées. Votre accès est bloqué jusqu'à ${
            date !== "-" ? `à ${date}` : "demain"
          }. Revenez d'ici quelques minutes.`,
        );
      }
      capture(e);
      setLoading(false);
    }
  };

  return (
    <>
      <Modal.Title>Saisir votre mot de passe de connexion</Modal.Title>
      <Modal.Subtitle>
        <div className="md:text-center mb-3">Pour sécuriser votre demande de changement d'adresse email, veuillez saisir votre mot de passe.</div>
      </Modal.Subtitle>
      <InputPassword label="Mot de passe" name="password" onChange={(e) => setPassword(e.target.value)} error={error} value={password} />
      <Modal.Buttons onCancel={onCancel} cancelText="Annuler" onConfirm={() => checkPassword(password)} confirmText="Continuer" disabled={isLoading} />
    </>
  );
};

export default PasswordModalContent;
