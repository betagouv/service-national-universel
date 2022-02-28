import React, { useState } from "react";
import { Formik, Field } from "formik";
import { Link, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import queryString from "query-string";

import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
import LoadingButton from "../../components/buttons/LoadingButton";
import Header from "./components/header";
import PasswordEye from "../../components/PasswordEye";

export default function Signin() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);
  const [userIsValid, setUserIsValid] = useState(true);
  const [tooManyRequests, settooManyRequests] = useState(false);
  const params = queryString.parse(location.search);
  const { redirect, unauthorized } = params;

  if (user) return <Redirect to={"/" + (redirect || "")} />;
  if (unauthorized === "1") toastr.error("Votre session a expiré", "Merci de vous reconnecter.", { timeOut: 10000 });

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <div className="flex flex-1 justify-center">
        <div className="hidden min-h-[400px] flex-[1] bg-[url('./assets/computer.jpeg')] bg-cover bg-center bg-no-repeat md:block" />
        <div className="flex flex-1 flex-col justify-center bg-gray-50 p-8">
          <div>
            <h1 className="auth-title">Espace Administrateur</h1>
            <h2 className="auth-subtitle">A destination des référents et des structures d’accueil</h2>
            <Formik
              initialValues={{ email: "", password: "" }}
              onSubmit={async ({ email, password }, actions) => {
                try {
                  const { user, token } = await api.post(`/referent/signin`, { email, password });
                  if (token) api.setToken(token);
                  if (user) {
                    dispatch(setUser(user));
                  }
                } catch (e) {
                  console.log("ERROR", e);
                  if (e && ["EMAIL_OR_PASSWORD_INVALID", "USER_NOT_EXISTS", "EMAIL_AND_PASSWORD_REQUIRED"].includes(e.code)) {
                    return setUserIsValid(false);
                  }
                  if (e.code === "TOO_MANY_REQUESTS") {
                    settooManyRequests(true);
                  }
                  toastr.error("Erreur détectée");
                }
                actions.setSubmitting(false);
              }}>
              {({ values, isSubmitting, handleChange, handleSubmit }) => {
                return (
                  <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
                    {!userIsValid && <div className="input-error-block">E-mail et/ou mot de passe incorrect(s)</div>}
                    {tooManyRequests && <div className="input-error-block">Vous avez atteint le maximum de tentatives de connexion autorisées. Réessayez dans une heure. </div>}

                    <div>
                      <label htmlFor="email" className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                        E-mail
                      </label>
                      <Field
                        autoComplete="username"
                        className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm font-medium text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                        name="email"
                        type="email"
                        id="email"
                        placeholder="Adresse e-mail"
                        value={values.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                        Mot de passe
                      </label>
                      <PasswordEye autoComplete="current-password" value={values.password} onChange={handleChange} showError={false} />
                    </div>
                    <Link to="/auth/forgot" className="text-sm font-medium text-brand-purple transition-colors hover:text-brand-darkPurple">
                      Mot de passe perdu ?
                    </Link>
                    <LoadingButton className="auth-button-primary" loading={isSubmitting} type="submit">
                      Se connecter
                    </LoadingButton>
                  </form>
                );
              }}
            </Formik>
          </div>
          <div className="flex flex-col gap-3 border-t border-gray-200 pt-4">
            <p className="text-center text-sm font-medium text-brand-grey ">
              Vous êtes une structure ?{" "}
              <Link to="/auth/signup" className="font-medium text-snu-purple-200 transition-colors hover:text-snu-purple-600">
                Publiez vos missions
              </Link>
            </p>
            <p className="text-center text-sm font-medium text-brand-grey ">
              Vous avez besoin d&apos;aide ?{" "}
              <Link to="/public-besoin-d-aide" className="font-medium text-snu-purple-200 transition-colors hover:text-snu-purple-600" target="_blank">
                Cliquez ici
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
