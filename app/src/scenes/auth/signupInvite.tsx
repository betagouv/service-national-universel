import queryString from "query-string";
import React, { useEffect, useState } from "react";
import useAuth from "@/services/useAuth";
import { useHistory } from "react-router-dom";
import { formatToActualTime, isValidRedirectUrl } from "snu-lib";
import plausibleEvent from "@/services/plausible";
import Eye from "../../assets/icons/Eye";
import EyeOff from "../../assets/icons/EyeOff";
import Input from "../../components/dsfr/forms/input";
import RightArrow from "../../assets/icons/RightArrow";
import api from "../../services/api";
import Error from "../../components/error";
import { getPasswordErrorMessage } from "../../utils";
import { environment } from "../../config";
import { captureMessage } from "../../sentry";
import { toastr } from "react-redux-toastr";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import { Button } from "@snu/ds/dsfr";

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
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState>({});
  const history = useHistory();

  const { young, login } = useAuth();
  const params = queryString.parse(window.location.search) as { redirect?: string };
  const { redirect } = params;

  useEffect(() => {
    if (young) history.push("/" + (redirect || ""));
  }, [young, history, redirect]);

  const onSubmit = async () => {
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
        const redirectionApproved = environment === "development" ? redirect : isValidRedirectUrl(redirect);

        if (!redirectionApproved) {
          captureMessage("Invalid redirect url", { extra: { redirect } });
          toastr.error("Erreur de redirection", "Url de redirection invalide : " + redirect);
          history.push("/");
          return;
        }
        window.location.href = redirect || "/";
      }
    } catch (e) {
      console.error(e);
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

  useEffect(() => {
    const errors: ErrorState = {};
    if (password && getPasswordErrorMessage(password)) {
      errors.password = getPasswordErrorMessage(password);
    }
    if (password && confirmPassword && password !== confirmPassword) {
      errors.passwordConfirm = "Les mots de passe ne correspondent pas";
    }
    setError(errors);
    setDisabled(!(Object.keys(errors).length === 0 && password && confirmPassword && email));
  }, [email, password, confirmPassword]);

  return (
    // <div className="flex bg-[#F9F6F2] py-6">
    <DSFRContainer title="Activer mon compte" className="flex flex-col bg-[#F9F6F2] py-6">
      <div className="mx-auto my-0 basis-[50%] bg-white px-[102px] py-[60px]">
        {error?.text && <Error {...error} onClose={() => setError({})} />}
        {/* <div className="mb-1 text-[32px] font-bold text-[#161616]">Activer mon compte</div> */}
        <div className="mb-2 flex items-center gap-4">
          <RightArrow />
          <div className="text-[21px] font-bold text-[#161616]">Mon espace volontaire</div>
        </div>
        <div className="mb-1 flex flex-col gap-1 pt-1 pb-4">
          <label className="text-base text-[#161616]">E-mail</label>
          <Input value={email} onChange={setEmail} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-base text-[#161616]">Mot de passe</label>
          <div className="flex w-full items-center rounded-t-[4px] border-b-[2px] border-[#3A3A3A] bg-[#EEEEEE] px-4 py-2">
            <Input type={showPassword ? "text" : "password"} className="w-full bg-inherit" value={password} onChange={(e) => setPassword(e.target.value)} />
            {showPassword ? <EyeOff className="cursor-pointer" onClick={() => setShowPassword(false)} /> : <Eye className="cursor-pointer" onClick={() => setShowPassword(true)} />}
          </div>
        </div>
        <div className={`pb-4 ${error?.password ? "text-[#CE0500]" : "text-[#3A3A3A]"} mt-1 text-xs`}>
          Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole.
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-base text-[#161616]">Confirmez votre mot de passe</label>
          <div className="flex w-full items-center rounded-t-[4px] border-b-[2px] border-[#3A3A3A] bg-[#EEEEEE] px-4 py-2">
            <Input type={showConfirmPassword ? "text" : "password"} className="w-full bg-inherit" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {showConfirmPassword ? (
              <EyeOff className="cursor-pointer" onClick={() => setShowConfirmPassword(false)} />
            ) : (
              <Eye className="cursor-pointer" onClick={() => setShowConfirmPassword(true)} />
            )}
          </div>
        </div>
        <div className={`pb-7 ${error?.passwordConfirm ? "text-[#CE0500]" : "text-[#3A3A3A]"} mt-1 text-xs`}>{error?.passwordConfirm}</div>
        <div className="flex w-full justify-end">
          <Button
            disabled={disabled || loading}
            className="flex cursor-pointer items-center justify-center bg-[#000091] px-3 py-2 text-white hover:border hover:border-[#000091] hover:bg-white hover:!text-[#000091]  disabled:cursor-default disabled:border-0 disabled:bg-[#E5E5E5] disabled:!text-[#929292]"
            onClick={onSubmit}>
            Connexion
          </Button>
        </div>
      </div>
    </DSFRContainer>
  );
};

export default Signin;
