import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import plausibleEvent from "@/services/plausible";
import RightArrow from "../../../assets/icons/RightArrow";
import Input from "../../../components/dsfr/forms/input";
import { setYoung } from "../../../redux/auth/actions";
import api from "../../../services/api";
import Error from "../../../components/error";
import queryString from "query-string";
import { useHistory } from "react-router-dom";
import { BsShieldLock } from "react-icons/bs";
import { isValidRedirectUrl } from "snu-lib/isValidRedirectUrl";
import { environment } from "../../../config";
import { captureMessage } from "../../../sentry";
import { DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MS } from "snu-lib";

const DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MIN = DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MS / 60 / 1000;

export default function Signin() {
  const [disabled, setDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({});
  const history = useHistory();
  const [token2FA, setToken2FA] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);

  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  const params = queryString.parse(location.search);
  const { redirect, disconnected, email } = params;

  React.useEffect(() => {
    if (!young && disconnected === "1") toastr.error("Votre session a expiré", "Merci de vous reconnecter.", { timeOut: 10000 });
    if (young) history.push("/" + (redirect || ""));
  }, [young]);

  const onSubmit = async ({ email, token, rememberMe }) => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      setLoading(true);
      const response = await api.post(`/young/signin-2fa`, { email, token_2fa: token.trim(), rememberMe });
      setLoading(false);
      if (response.token) api.setToken(response.token);
      if (response.user) {
        plausibleEvent("2FA/ Connexion réussie");
        dispatch(setYoung(response.user));
        const redirectionApproved = environment === "development" ? redirect : isValidRedirectUrl(redirect);
        if (!redirectionApproved) {
          captureMessage("Invalid redirect url", { extra: { redirect } });
          toastr.error("Url de redirection invalide : " + redirect);
          return history.push("/");
        }
        return (window.location.href = redirect);
      }
    } catch (e) {
      setLoading(false);
      toastr.error(
        "(Double authentification) Code non reconnu.",
        `Merci d'inscrire le dernier code reçu par email. Après 3 tentatives ou plus de ${DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MIN} minutes, veuillez retenter de vous connecter.`,
      );
    }
  };

  React.useEffect(() => {
    if (token2FA) setDisabled(false);
    else setDisabled(true);
  }, [token2FA]);

  return (
    <div className="flex bg-[#F9F6F2] py-6">
      <div className="mx-auto my-0 basis-[50%] bg-white px-[102px] py-[60px]">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="mb-1 text-[32px] font-bold text-[#161616]">Me connecter</div>
        <div className="mb-2 flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#161616] text-[21px] my-2 ">
            <BsShieldLock className="text-[#161616]text-4xl" /> Authentification à deux facteurs
          </div>
        </div>
        <div className="mb-1 flex flex-col gap-1 py-1">
          <label className="text-[14px] text-[#3A3A3A] mb-1">
            Un mail contenant le code unique de connexion vous a été envoyé à l'adresse "<b>{email}</b>".
          </label>
          <label className="text-[14px] text-[#3A3A3A] mb-4">
            Ce code est valable pendant {DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MIN} minutes, si vous avez reçu plusieurs codes veuillez svp utiliser le dernier qui vous a été
            transmis par mail.
          </label>
          <label className="text-[14px] text-[#3A3A3A] mb-2">Saisir le code reçu par email</label>
          <Input placeholder="123abc" value={token2FA} onChange={(e) => setToken2FA(e)} />
        </div>
        <div>
          <label htmlFor="rememberMe" className="text-sm text-brand-black/80 mt-2">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              className="mr-2 cursor-pointer"
              checked={rememberMe}
              onChange={() => {
                setRememberMe(!rememberMe);
              }}
            />
            <strong>Faire confiance à ce navigateur :</strong> la double authentification vous sera demandée à nouveau dans un délai d’un mois. Ne pas cocher cette case si vous
            utilisez un ordinateur partagé ou public
          </label>
        </div>
        <div className="flex w-full justify-end">
          <button
            disabled={disabled || loading}
            className="flex cursor-pointer items-center justify-center bg-[#000091] px-3 py-2 mt-4 text-white hover:border hover:border-[#000091] hover:bg-white hover:!text-[#000091]  disabled:cursor-default disabled:border-0"
            onClick={() => onSubmit({ email, token: token2FA, rememberMe })}>
            Connexion
          </button>
        </div>
        <hr className="mt-4"></hr>
        <div className="mt-4">
          <label className="text-gray-500 text-[12px] mb-2">Si vous ne recevez pas le mail, nous vous invitons à vérifier que :</label>
          <ul className="text-[#0063CB] text-xs mb-2 list-disc">
            <li className="ml-3 mb-1">L'adresse mail que vous utilisez est bien celle indiquée ci-dessus</li>
            <li className="ml-3 mb-1">Le mail ne se trouve pas dans vos spam</li>
            <li className="ml-3 mb-1">L'adresse mail no_reply-auth@snu.gouv.fr ne fait pas partie des adresses indésirables de votre boite mail</li>
            <li className="ml-3 mb-1">Votre boite de réception n'est pas saturée</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
