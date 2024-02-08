import React, { useState } from "react";
import { Link, Redirect, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import queryString from "query-string";
import plausibleEvent from "@/services/plausible";
import { maintenance } from "../../config";
import { environment } from "../../config";
import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
import Header from "./components/header";
import { GoTools } from "react-icons/go";
import { BsShieldCheck } from "react-icons/bs";
import { isValidRedirectUrl } from "snu-lib/isValidRedirectUrl";
import { captureMessage } from "../../sentry";

export default function Signin() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);
  const params = queryString.parse(location.search);
  const { redirect, unauthorized, email } = params;
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const history = useHistory();

  const [token2FA, setToken2FA] = useState("");

  if (user) return <Redirect to={"/" + (redirect || "")} />;
  if (unauthorized === "1") toastr.error("Votre session a expiré", "Merci de vous reconnecter.", { timeOut: 10000 });

  const onSubmit = async ({ email, token, rememberMe }) => {
    try {
      setLoading(true);
      const response = await api.post(`/referent/signin-2fa`, { email, token_2fa: token.trim(), rememberMe });
      setLoading(false);
      if (response.token) api.setToken(response.token);
      if (response.user) {
        plausibleEvent("2FA / Connexion réussie");
        dispatch(setUser(response.user));
        if (!redirect) return history.push("/");
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
      console.log("ERROR", e);
      toastr.error(
        "(Double authentification) Code non reconnu.",
        "Merci d'inscrire le dernier code reçu par email. Après 3 tentatives ou plus de 10 minutes, veuillez retenter de vous connecter.",
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Header />
      <div className="flex flex-1 justify-center">
        <div className="hidden min-h-[400px] flex-[1] bg-[url('./assets/computer.jpeg')] bg-cover bg-center bg-no-repeat md:block" />
        <div className="flex flex-1 flex-col justify-center bg-gray-50 p-8">
          <div className="px-16">
            <h1 className="text-xl font-bold text-brand-black md:text-3xl">Espace Administrateur</h1>
            {maintenance && !localStorage?.getItem("override_maintenance") ? (
              <div className="m-4 flex items-center">
                <div className="rounded-lg bg-yellow-50 p-3 shadow-sm ">
                  <div className="flex items-center space-x-2 ">
                    <GoTools className="text-base text-yellow-600" />
                    <h5 className="text-base text-yellow-600">MAINTENANCE</h5>
                  </div>
                  <div className="pt-2  text-sm text-yellow-900">
                    Le site est actuellement en maintenance suite à un problème technique sur la plateforme. Nous faisons notre possible pour rétablir la situation.
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <div className="bg-blue-100 p-2 rounded-lg border-2 border-solid border-blue-300">
                  <div className="flex items-center gap-2 text-blue-500 uppercase mt-2 mb-2">
                    <BsShieldCheck className="text-blue-500 text-xl" />
                    <p className="text-sm">Authentification à deux facteurs</p>
                  </div>
                  <div className="px-6">
                    <p className="self-stretch mb-2">
                      Un mail contenant le code unique de connexion vous a été envoyé à l'adresse <b>{email}</b>.
                    </p>
                    <p className="self-stretch mb-2">
                      Ce code est valable pendant <b>10 minutes</b>, si vous avez reçu plusieurs codes veuillez <b>utiliser le dernier</b> qui vous a été transmis par mail.
                    </p>
                  </div>
                </div>
                <p className="mt-3 mb-2">Code</p>
                <div className="self-stretch">
                  <input
                    className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                    name="token2FA"
                    type="text"
                    id="token2FA"
                    placeholder="123xxx"
                    value={token2FA}
                    onChange={(e) => setToken2FA(e.target.value)}
                  />
                </div>

                <label className="text-sm text-brand-black/80 mt-2">
                  <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="mr-2" />
                  <strong>Faire confiance à ce navigateur :</strong> la double authentification vous sera demandée à nouveau dans un délai d’un mois. Ne pas cocher cette case si
                  vous utilisez un ordinateur partagé ou public
                </label>

                <div className="flex justify-end">
                  <button
                    disabled={loading}
                    onClick={() => onSubmit({ email, token: token2FA, rememberMe })}
                    className="block cursor-pointer !rounded-xl border-0 bg-[#2563EB] py-3 px-4 mt-2 text-base font-medium text-white transition-colors">
                    Se connecter
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="px-12">
            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 mt-2">
              {!maintenance && (
                <h1 className="mt-2">
                  <strong>Si vous ne recevez pas de mail, veuillez vérifier que :</strong>
                </h1>
              )}
              <ul className="ml-2">
                <li>L'adresse mail que vous utilisez est bien celle indiquée ci-dessus</li>
                <li>Le mail ne se trouve pas dans vos spams</li>
                <li>L'adresse mail no_reply-mailauto@snu.gouv.fr ne fait pas partie des adresses indésirables de votre boite mail</li>
                <li>Votre boite de réception n'est pas saturée</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
