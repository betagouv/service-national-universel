import queryString from "query-string";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { formatToActualTime, isValidRedirectUrl } from "snu-lib";
import plausibleEvent from "@/services/plausible";
import Eye from "../../../assets/icons/Eye";
import EyeOff from "../../../assets/icons/EyeOff";
import RightArrow from "../../../assets/icons/RightArrow";
import Input from "../../../components/dsfr/forms/input";
import { setYoung } from "../../../redux/auth/actions";
import api from "../../../services/api";
import Error from "../../../components/error";
import { getPasswordErrorMessage } from "../../../utils";
import { cohortsInit } from "../../../utils/cohorts";
import { environment } from "../../../config";
import { toastr } from "react-redux-toastr";
import { captureMessage } from "../../../sentry";

export default function Signin() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [disabled, setDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({});
  const history = useHistory();

  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  const params = queryString.parse(location.search);
  const { redirect } = params;

  React.useEffect(() => {
    if (young) history.push("/" + (redirect || ""));
  }, [young]);

  const onSubmit = async () => {
    if (loading || disabled) return;
    if (password !== confirmPassword) return setError({ text: "Les mots de passe ne correspondent pas" });
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const invitationToken = urlParams.get("token");
      const { data: young } = await api.post(`/young/signup_invite`, { email, password, invitationToken: invitationToken });
      if (young) {
        plausibleEvent("INVITATION/ Connexion réussie");
        dispatch(setYoung(young));
        await cohortsInit();
        const redirectionApproved = environment === "development" ? redirect : isValidRedirectUrl(redirect);
        if (!redirectionApproved) {
          captureMessage("Invalid redirect url", { extra: { redirect } });
          toastr.error("Url de redirection invalide : " + redirect);
          return history.push("/");
        }
        return (window.location.href = redirect);
      }
    } catch (e) {
      console.log(e);
      if (e.code === "PASSWORD_NOT_VALIDATED") {
        setError({ text: "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole" });
      } else if (e.code === "TOO_MANY_REQUESTS") {
        let date = formatToActualTime(e?.data?.nextLoginAttemptIn);
        setError({
          text: "Vous avez atteint le maximum de tentatives de connexion autorisées.",
          subText: `Votre accès est bloqué jusqu'à ${date !== "-" ? `à ${date}.` : "demain."}. Revenez d'ici quelques minutes.`,
        });
      } else if (e.code === "YOUNG_ALREADY_REGISTERED") {
        setError({ text: "Vous êtes déjà inscrit" });
      } else if (!e.ok) {
        setError({ text: "Une erreur est survenue. Essayez de rafraîchir la page" });
      }
    }
    setLoading(false);
  };

  React.useEffect(() => {
    let errors = {};
    if (password && getPasswordErrorMessage(password)) {
      errors.password = getPasswordErrorMessage(password);
    }
    //Password confirm
    if (password && confirmPassword && password !== confirmPassword) {
      errors.passwordConfirm = "Les mots de passe ne correspondent pas";
    }
    setError(errors);
    if (Object.keys(errors).length === 0 && password && confirmPassword && email) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [email, password, confirmPassword]);

  return (
    <>
      <div className="bg-white px-4 pt-4 pb-12">
        {error?.text && <Error {...error} onClose={() => setError({})} />}

        <div className="text-[22px] font-bold text-[#161616]">Activer mon compte</div>
        <div className="flex items-center gap-4 py-4">
          <RightArrow />
          <div className="text-[17px] font-bold text-[#161616]">Mon espace volontaire</div>
        </div>
        <div className="flex flex-col gap-1 pt-1 pb-4">
          <label className="text-base text-[#161616]">E-mail</label>
          <Input value={email} onChange={(e) => setEmail(e)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-base text-[#161616]">Mot de passe</label>
          <div className="flex w-full items-center rounded-t-[4px] border-b-[2px] border-[#3A3A3A] bg-[#EEEEEE] px-4 py-2">
            <input className="w-full bg-inherit" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            {showPassword ? <EyeOff className="cursor-pointer" onClick={() => setShowPassword(false)} /> : <Eye className="cursor-pointer" onClick={() => setShowPassword(true)} />}
          </div>
        </div>
        <div className={`pb-4 ${error?.password ? "text-[#CE0500]" : "text-[#3A3A3A]"} mt-1 text-xs`}>
          Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole.
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-base text-[#161616]">Confirmez votre mot de passe</label>
          <div className="flex w-full items-center rounded-t-[4px] border-b-[2px] border-[#3A3A3A] bg-[#EEEEEE] px-4 py-2">
            <input className="w-full bg-inherit" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {showConfirmPassword ? (
              <EyeOff className="cursor-pointer" onClick={() => setShowConfirmPassword(false)} />
            ) : (
              <Eye className="cursor-pointer" onClick={() => setShowConfirmPassword(true)} />
            )}
          </div>
        </div>
        <div className={`pb-7 ${error?.passwordConfirm ? "text-[#CE0500]" : "text-[#3A3A3A]"} mt-1 text-xs`}>{error?.passwordConfirm ? error.passwordConfirm : null}</div>
        <button
          className={`flex w-full cursor-pointer items-center justify-center p-2 ${disabled || loading ? "bg-[#E5E5E5] text-[#929292]" : "bg-[#000091] text-white"}`}
          onClick={onSubmit}>
          Connexion
        </button>
      </div>
    </>
  );
}
