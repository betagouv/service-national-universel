import queryString from "query-string";
import React from "react";
import useAuth from "@/services/useAuth";
import { toastr } from "react-redux-toastr";
import plausibleEvent from "@/services/plausible";
import { useHistory } from "react-router-dom";
import Input from "../../../components/dsfr/forms/input";
import api from "../../../services/api";
import Error from "../../../components/error";
import { BsShieldLock } from "react-icons/bs";
import { isValidRedirectUrl } from "snu-lib";
import { captureMessage } from "../../../sentry";
import { DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MS } from "snu-lib";

const DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MIN = DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MS / 60 / 1000;

export default function Signin() {
  const params = queryString.parse(location.search);
  const { redirect, disconnected, email } = params;
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(
    disconnected
      ? {
          text: "Votre session a expiré",
          subText: "Merci de vous reconnecter.",
        }
      : {},
  );
  const history = useHistory();
  const [token2FA, setToken2FA] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const { login } = useAuth();
  const disabled = !token2FA || loading;

  const onSubmit = async ({ email, token, rememberMe }) => {
    setLoading(true);
    try {
      const response = await api.post(`/young/signin-2fa`, { email, token_2fa: token.trim(), rememberMe });

      if (!response.user) return;

      plausibleEvent("2FA/ Connexion réussie");
      await login(response.user);

      if (!redirect) {
        history.push("/");
        return;
      }

      const redirectionApproved = isValidRedirectUrl(redirect);

      if (!redirectionApproved) {
        captureMessage("Invalid redirect url", { extra: { redirect } });
        toastr.error("Url de redirection invalide : " + redirect);
        return history.push("/");
      }
      history.push(redirect);
    } catch (e) {
      toastr.error(
        "Code non reconnu.",
        `Merci d'inscrire le dernier code reçu par email. Après 3 tentatives ou plus de ${DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MIN} minutes, veuillez retenter de vous connecter.`,
        {
          timeOut: 10_000,
        },
      );
    }
    setLoading(false);
  };

  return (
    <>
      <div className="bg-white px-4 pt-4 pb-12">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <h1 className="text-2xl font-bold">Me connecter</h1>

        <div className="flex items-center gap-4 py-4 text-xl">
          <BsShieldLock className="text-3xl flex-none" />
          Authentification à deux facteurs
        </div>

        <div className="flex flex-col gap-1 py-4 text-sm leading-relaxed">
          <p className="mb-1">
            Un mail contenant le code unique de connexion vous a été envoyé à l'adresse "<b>{email}</b>".
          </p>
          <p className="mb-4">
            Ce code est valable pendant {DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MIN} minutes, si vous avez reçu plusieurs codes veuillez svp utiliser le dernier qui vous a été
            transmis par mail.
          </p>
          <label>
            Saisir le code reçu par email
            <Input placeholder="123abc" value={token2FA} onChange={(e) => setToken2FA(e)} />
          </label>
        </div>

        <label htmlFor="rememberMe" className="text-sm text-brand-black/80 mb-4">
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

        <button
          disabled={disabled}
          className="flex w-full cursor-pointer items-center justify-center p-2 bg-[#000091] text-white"
          onClick={() => onSubmit({ email, token: token2FA, rememberMe })}>
          Connexion
        </button>
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
    </>
  );
}
