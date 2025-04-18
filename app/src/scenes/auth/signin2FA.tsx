import React, { useState } from "react";
import useAuth from "@/services/useAuth";
import { toastr } from "react-redux-toastr";
import plausibleEvent from "@/services/plausible";
import Input from "../../components/dsfr/forms/input";
import api from "../../services/api";
import Error from "../../components/error";
import queryString from "query-string";
import { useHistory } from "react-router-dom";
import { BsShieldLock } from "react-icons/bs";
import { isValidRedirectUrl, DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MS } from "snu-lib";
import { captureMessage } from "../../sentry";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import { Button } from "@snu/ds/dsfr";

const DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MIN = DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MS / 60 / 1000;

interface ErrorState {
  text?: string;
  subText?: string;
}

interface Params {
  redirect?: string;
  email?: string;
}

const Signin2FA: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState>({});
  const history = useHistory();
  const [token2FA, setToken2FA] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const disabled = !token2FA || loading;

  const { login } = useAuth();

  const params = queryString.parse(location.search) as Params;
  const { redirect, email } = params;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post(`/young/signin-2fa`, { email, token_2fa: token2FA.trim(), rememberMe });

      if (!response.user) return;

      plausibleEvent("2FA/ Connexion réussie");
      await login(response.user);

      const redirectionApproved = isValidRedirectUrl(redirect);

      if (!redirectionApproved) {
        captureMessage("Invalid redirect url", { extra: { redirect } });
        toastr.error("Erreur", "Url de redirection invalide : " + redirect);
        return history.push("/");
      }

      return history.push(redirect || "/");
    } catch (e) {
      setError({
        text: "(Double authentification) Code non reconnu.",
        subText: `Merci d'inscrire le dernier code reçu par email. Après 3 tentatives ou plus de ${DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MIN} minutes, veuillez retenter de vous connecter.`,
      });
      setLoading(false);
    }
  };

  return (
    <DSFRContainer title="Me connecter" className="flex flex-col ">
      {error && Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
      <div className="mb-2 flex items-center gap-4">
        <div className="flex items-center gap-2 text-[#161616] text-[21px] my-2 ">
          <BsShieldLock className="text-[#161616]text-4xl" /> Authentification à deux facteurs
        </div>
      </div>
      <form onSubmit={onSubmit}>
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
          <Button
            disabled={disabled}
            className="flex cursor-pointer items-center justify-center bg-[#000091] px-3 py-2 mt-4 text-white hover:border hover:border-[#000091] hover:bg-white hover:!text-[#000091]  disabled:cursor-default disabled:border-0"
            type="submit">
            Connexion
          </Button>
        </div>
      </form>
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
    </DSFRContainer>
  );
};

export default Signin2FA;
