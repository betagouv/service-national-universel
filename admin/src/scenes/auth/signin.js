import React, { useState } from "react";
import { Formik, Field } from "formik";
import { Link, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import queryString from "query-string";
import { maintenance } from "../../config";

import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
import LoadingButton from "../../components/buttons/LoadingButton";
import Header from "./components/header";
import PasswordEye from "../../components/PasswordEye";
import { GoTools } from "react-icons/go";
import { formatToActualTime } from "snu-lib/date";

export default function Signin() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);
  const [userIsValid, setUserIsValid] = useState(true);
  const [tooManyRequests, setTooManyRequests] = useState({ status: false, date: null });
  const params = queryString.parse(location.search);
  const { redirect, unauthorized } = params;

  if (user) return <Redirect to={"/" + (redirect || "")} />;
  if (unauthorized === "1") toastr.error("Votre session a expiré", "Merci de vous reconnecter.", { timeOut: 10000 });

  return (
    <div className="flex flex-1 flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 justify-center">
        <div className="hidden min-h-[400px] flex-[1] bg-[url('./assets/computer.jpeg')] bg-cover bg-center bg-no-repeat md:block" />
        <div className="flex flex-1 flex-col justify-center bg-gray-50 p-8">
          <div>
            <h1 className="mb-4 text-xl font-bold text-brand-black md:text-3xl">Espace Administrateur</h1>
            <h2 className="mb-8 text-base font-normal text-brand-grey">A destination des référents et des structures d’accueil</h2>

            {maintenance && !localStorage?.getItem("override_maintenance") ? (
              <div className="flex items-center m-4">
                <div className="bg-yellow-50 p-3 rounded-lg shadow-sm ">
                  <div className="flex space-x-2 items-center ">
                    <GoTools className="text-yellow-600 text-base" />
                    <h5 className="text-yellow-600 text-base">MAINTENANCE</h5>
                  </div>
                  <div className="text-yellow-900  pt-2 text-sm">
                    Le site est actuellement en maintenance suite à un problème technique sur la plateforme. Nous faisons notre possible pour rétablir la situation.
                  </div>
                </div>
              </div>
            ) : (
              <Formik
                initialValues={{ email: "", password: "" }}
                onSubmit={async ({ email, password }, actions) => {
                  try {
                    const { user, token } = await api.post(`/referent/signin`, { email, password });
                    if (token) api.setToken(token);
                    if (user) {
                      if (redirect?.startsWith("http")) return (window.location.href = redirect);
                      dispatch(setUser(user));
                    }
                  } catch (e) {
                    actions.setFieldValue("password", "");
                    console.log("ERROR", e);
                    if (e && ["EMAIL_OR_PASSWORD_INVALID", "USER_NOT_EXISTS", "EMAIL_AND_PASSWORD_REQUIRED"].includes(e.code)) {
                      return setUserIsValid(false);
                    }
                    if (e.code === "TOO_MANY_REQUESTS") {
                      setTooManyRequests({ status: true, date: formatToActualTime(e?.data?.nextLoginAttemptIn) });
                    }
                    toastr.error("Erreur détectée");
                  }
                  actions.setSubmitting(false);
                }}>
                {({ values, isSubmitting, handleChange, handleSubmit }) => {
                  return (
                    <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4 items-start">
                      {!userIsValid && (
                        <div className="block w-full rounded bg-red-50 py-2.5 px-4 text-sm text-red-500 border border-red-400">E-mail et/ou mot de passe incorrect(s)</div>
                      )}
                      {tooManyRequests?.status && (
                        <div className="block w-full rounded border border-red-400 bg-red-50 py-2.5 px-4 text-sm text-red-500">
                          Vous avez atteint le maximum de tentatives de connexion autorisées. Réessayez {tooManyRequests.date !== "-" ? `à ${tooManyRequests.date}.` : "demain."}
                        </div>
                      )}

                      <div className="self-stretch">
                        <label htmlFor="email" className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                          E-mail
                        </label>
                        <Field
                          autoComplete="username"
                          className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                          name="email"
                          type="email"
                          id="email"
                          placeholder="Adresse e-mail"
                          value={values.email}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="self-stretch">
                        <label htmlFor="password" className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                          Mot de passe
                        </label>
                        <PasswordEye autoComplete="current-password" value={values.password} onChange={handleChange} showError={false} />
                      </div>
                      <Link to="/auth/forgot" className="text-sm text-brand-purple transition-colors hover:text-brand-darkPurple hover:underline">
                        Mot de passe perdu ?
                      </Link>
                      <LoadingButton
                        className="block cursor-pointer !rounded-xl border-0 bg-brand-purple py-2 px-5 text-base font-medium text-white transition-colors"
                        loading={isSubmitting}
                        type="submit">
                        Se connecter
                      </LoadingButton>
                    </form>
                  );
                }}
              </Formik>
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
