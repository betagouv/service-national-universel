import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import queryString from "query-string";
import { maintenance } from "../../config";

import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
import Header from "./components/header";
import { GoTools } from "react-icons/go";
import { BsShieldLock } from "react-icons/bs";

export default function Signin() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);
  const params = queryString.parse(location.search);
  const { redirect, unauthorized, email } = params;
  const [loading, setLoading] = useState(false);

  const [token2FA, setToken2FA] = useState("");

  if (user) return <Redirect to={"/" + (redirect || "")} />;
  if (unauthorized === "1") toastr.error("Votre session a expiré", "Merci de vous reconnecter.", { timeOut: 10000 });

  const onSubmit = async ({ email, token }) => {
    try {
      setLoading(true);
      const response = await api.post(`/referent/signin-2fa`, { email, token_2fa: token });
      setLoading(false);
      if (response.token) api.setToken(response.token);
      if (response.user) {
        if (redirect?.startsWith("http")) return (window.location.href = redirect);
        dispatch(setUser(response.user));
      }
    } catch (e) {
      setLoading(false);
      console.log("ERROR", e);
      toastr.error("Erreur détectée");
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Header />
      <div className="flex flex-1 justify-center">
        <div className="hidden min-h-[400px] flex-[1] bg-[url('./assets/computer.jpeg')] bg-cover bg-center bg-no-repeat md:block" />
        <div className="flex flex-1 flex-col justify-center bg-gray-50 p-8">
          <div>
            <h1 className="mb-4 text-xl font-bold text-brand-black md:text-3xl">Espace Administrateur</h1>
            <h2 className="text-base font-normal text-brand-grey">A destination des référents et des structures d’accueil</h2>

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
              <div>
                <div className="flex items-center gap-2 text-blue-500 uppercase my-8 ">
                  <BsShieldLock className="text-blue-500 text-4xl" /> Authentification à deux facteurs
                </div>
                <div className="self-stretch">
                  Merci d'entrer le code transmis par e-mail à l'adresse <b>{email}</b> :
                </div>
                <div className="self-stretch my-2">
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
                <button
                  disabled={loading}
                  onClick={() => onSubmit({ email, token: token2FA })}
                  className="block cursor-pointer !rounded-xl border-0 bg-brand-purple py-2 px-5 text-base font-medium text-white transition-colors">
                  Valider
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 border-t border-gray-200 pt-4">
            {!maintenance && (
              <p className="text-center text-sm text-brand-grey ">
                Vous êtes une structure ?{" "}
                <Link to="/auth/signup" className="text-snu-purple-200 transition-colors hover:text-snu-purple-600 hover:underline">
                  Publiez vos missions
                </Link>
              </p>
            )}
            <p className="text-center text-sm text-brand-grey ">
              Vous avez besoin d&apos;aide ?{" "}
              <Link
                rel="noreferrer"
                to={`/public-besoin-d-aide?from=${window.location.pathname}`}
                className="text-snu-purple-200 transition-colors hover:text-snu-purple-600 hover:underline"
                target="_blank">
                Cliquez ici
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
