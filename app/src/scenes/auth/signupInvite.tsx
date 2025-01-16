import React, { useEffect, useState } from "react";
import useAuth from "@/services/useAuth";
import { useHistory } from "react-router-dom";
import { formatToActualTime } from "snu-lib";
import plausibleEvent from "@/services/plausible";
import Input from "../../components/dsfr/forms/input";
import RightArrow from "../../assets/icons/RightArrow";
import api from "../../services/api";
import Error from "../../components/error";
import { getPasswordErrorMessage } from "../../utils";
import { environment } from "../../config";
import { toastr } from "react-redux-toastr";
import { capture } from "../../sentry";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import { InputPassword, Button } from "@snu/ds/dsfr";

interface ErrorState {
  text?: string;
  subText?: string;
  password?: string;
  passwordConfirm?: string;
}

const Signin: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState>({});
  const history = useHistory();

  const { login } = useAuth();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || disabled) return;
    if (password !== confirmPassword) return setError({ text: "Les mots de passe ne correspondent pas" });

    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const invitationToken = urlParams.get("token");
      const { data: young } = await api.post(`/young/signup_invite`, { email, password, invitationToken });
      if (young) {
        plausibleEvent("INVITATION/ Connexion réussie");
        await login(young);
        history.push("/home");
      }
    } catch (e) {
      capture(e);
      if (e.code === "PASSWORD_NOT_VALIDATED") {
        setError({ text: "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole" });
      } else if (e.code === "TOO_MANY_REQUESTS") {
        const date = formatToActualTime(e?.data?.nextLoginAttemptIn);
        setError({
          text: "Vous avez atteint le maximum de tentatives de connexion autorisées.",
          subText: `Votre accès est bloqué jusqu'à ${date !== "-" ? `à ${date}.` : "demain."}. Revenez d'ici quelques minutes.`,
        });
      } else if (e.code === "YOUNG_ALREADY_REGISTERED") {
        setError({ text: "Vous êtes déjà inscrit" });
      } else {
        setError({ text: "Une erreur est survenue. Essayez de rafraîchir la page" });
      }
    }
    setLoading(false);
  };

  interface ValidatePasswordProps {
    password: string;
    confirmPassword: string;
    email: string;
  }

  const validatePassword = ({ password, confirmPassword, email }: ValidatePasswordProps): void => {
    const errors: ErrorState = {};
    if (password && getPasswordErrorMessage(password)) {
      errors.password = getPasswordErrorMessage(password);
    }
    if (password && confirmPassword && password !== confirmPassword) {
      errors.passwordConfirm = "Les mots de passe ne correspondent pas";
    }
    setError(errors);
    setDisabled(!(Object.keys(errors).length === 0 && password && confirmPassword && email));
  };

  useEffect(() => {
    validatePassword({ password, confirmPassword, email });
  }, [email, password, confirmPassword]);

  return (
    <DSFRContainer title="Activer mon compte" className="flex flex-col bg-[#F9F6F2] py-6">
      {error?.text && <Error {...error} onClose={() => setError({})} />}
      <div className="mb-2 flex items-center gap-4">
        <RightArrow />
        <div className="text-[21px] font-bold text-[#161616]">Mon espace volontaire</div>
      </div>
      <form onClick={onSubmit}>
        <div className="mb-1 flex flex-col gap-1 pt-1 pb-4">
          <label className="text-base text-[#161616]">E-mail</label>
          <Input value={email} onChange={setEmail} />
        </div>
        <div className="flex flex-col gap-1">
          <InputPassword label="Mot de passe" name="password" value={password} onChange={setPassword} />
        </div>
        <div className={`pb-4 ${error?.password ? "text-[#CE0500]" : "text-[#3A3A3A]"} mt-1 text-xs`}>
          Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole.
        </div>
        <div className="flex flex-col gap-1">
          <InputPassword label="Confirmez votre mot de passe" name="confirmPassword" value={confirmPassword} onChange={setConfirmPassword} />
        </div>
        <div className={`pb-7 ${error?.passwordConfirm ? "text-[#CE0500]" : "text-[#3A3A3A]"} mt-1 text-xs`}>{error?.passwordConfirm}</div>
        <div className="flex w-full justify-end">
          <Button
            disabled={disabled || loading}
            className="flex cursor-pointer items-center justify-center bg-[#000091] px-3 py-2 text-white hover:border hover:border-[#000091] hover:bg-white hover:!text-[#000091]  disabled:cursor-default disabled:border-0 disabled:bg-[#E5E5E5] disabled:!text-[#929292]"
            type="submit">
            Connexion
          </Button>
        </div>
      </form>
    </DSFRContainer>
  );
};

export default Signin;
