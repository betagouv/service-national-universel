import React, { useEffect, useState } from "react";
import { Formik, Field } from "formik";
import validator from "validator";
import { Link, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import { setUser } from "../../redux/auth/actions";

import api from "../../services/api";
import LoadingButton from "../../components/buttons/LoadingButton";
import PasswordEye from "../../components/PasswordEye";
import Header from "./components/header";
import { adminURL } from "../../config";

import { translate, ROLES } from "snu-lib";
import { classNames } from "../../utils";
import Loader from "../../components/Loader";
import { requiredMessage } from "../../components/errorMessage";

export default function SignupInvite() {
  const [invitation, setInvitation] = useState("");
  const [newuser, setNewUser] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const invitationToken = urlParams.get("token");

  useEffect(() => {
    (async () => {
      try {
        if (!invitationToken) return setInvitation("INVITATION_TOKEN_EXPIRED_OR_INVALID");
        const { data, token } = await api.post(`/referent/signup_verify`, { invitationToken });
        if (token) api.setToken(token);
        setNewUser(data);
      } catch (error) {
        if (error?.code === "INVITATION_TOKEN_EXPIRED_OR_INVALID") return setInvitation("INVITATION_TOKEN_EXPIRED_OR_INVALID");
      }
    })();
  }, []);

  const dispatch = useDispatch();

  const user = useSelector((state) => state.Auth.user);

  if (invitation === "INVITATION_TOKEN_EXPIRED_OR_INVALID") return <Redirect to="/auth/invitationexpired" />;
  if (user) return <Redirect to="/" />;

  if (!newuser) return <Loader />;

  let title;
  if (newuser.department && newuser.role === ROLES.REFERENT_DEPARTMENT) {
    // eslint-disable-next-line no-irregular-whitespace
    title = `Activez votre compte de Référent du département : ${newuser.department}`;
  } else {
    title = "Activez votre compte";
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <div className="flex flex-1 justify-center">
        <div className="hidden min-h-[400px] flex-1 bg-[url('./assets/rang.jpg')] bg-cover bg-center bg-no-repeat md:block" />

        <div className="flex flex-1 flex-col justify-center bg-gray-50 p-8">
          <h1 className="mb-4 text-xl font-bold text-brand-black md:text-3xl">{title}</h1>
          <Formik
            initialValues={{ firstName: newuser.firstName, lastName: newuser.lastName, email: newuser.email, password: "", repassword: "", acceptCGU: "" }}
            onSubmit={async (values, actions) => {
              try {
                const { data: user, token, ok } = await api.post(`/referent/signup_invite`, { ...values, invitationToken, acceptCGU: values.acceptCGU });
                actions.setSubmitting(false);
                if (ok && token) api.setToken(token);
                if (ok && user) dispatch(setUser(user));
              } catch (e) {
                actions.setSubmitting(false);
                console.log("e", e);
                if (e.code === "PASSWORD_NOT_VALIDATED")
                  return toastr.error(
                    "Mot de passe incorrect",
                    "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole",
                    { timeOut: 10000 },
                  );
                if (e.code === "USER_ALREADY_REGISTERED") return toastr.error("Votre compte est déja activé. Veuillez vous connecter", { timeOut: 10000 });
                return toastr.error("Problème", translate(e.code));
              }
            }}>
            {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
              return (
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div className="col-span-2">
                    <label className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">ADRESSE EMAIL</label>
                    <Field
                      className={classNames(
                        errors.email ? "border-red-500" : "",
                        "block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm font-medium text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey",
                      )}
                      validate={(v) => !validator.isEmail(v) && "Veuillez renseigner votre email"}
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder="Email"
                      haserror={errors.email}
                    />
                    <p className="text-xs text-red-500">{errors.email}</p>
                  </div>
                  <div>
                    <label htmlFor="firstName" className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                      Prénom
                    </label>
                    <Field
                      className={classNames(
                        errors.firstName ? "border-red-500" : "",
                        "block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm font-medium text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey",
                      )}
                      validate={(v) => validator.isEmpty(v) && "Ce champ est requis"}
                      name="firstName"
                      type="name"
                      id="firstName"
                      value={values.firstName}
                      onChange={handleChange}
                      placeholder="Prénom"
                      haserror={errors.firstName}
                    />
                    <p className="text-xs text-red-500">{errors.firstName}</p>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                      Nom
                    </label>
                    <Field
                      className={classNames(
                        errors.lastName ? "border-red-500" : "",
                        "block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm font-medium text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey",
                      )}
                      validate={(v) => validator.isEmpty(v) && "Ce champ est requis"}
                      name="lastName"
                      type="lastName"
                      id="lastName"
                      value={values.lastName}
                      onChange={handleChange}
                      placeholder="Nom"
                      haserror={errors.lastName}
                    />
                    <p className="text-xs text-red-500">{errors.lastName}</p>
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="password" className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                      <span className="mr-1">*</span>Mot de passe
                    </label>
                    <p className="mb-2 text-xs text-brand-grey">👉 Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole</p>
                    <PasswordEye autoComplete="new-password" value={values.password} onChange={handleChange} name="password" id="password" />
                    <p className="text-xs text-red-500">{errors.password}</p>
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="repassword" className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">
                      <span className="mr-1">*</span>Confirmation mot de passe
                    </label>
                    <PasswordEye
                      validate={() => values.password !== values.repassword && "Les mots de passe ne correspondent pas."}
                      autoComplete="new-password"
                      value={values.repassword}
                      onChange={handleChange}
                      name="repassword"
                      id="repassword"
                      placeholder="Confirmez votre mot de passe"
                    />
                    <p className="text-xs text-red-500">{errors.repassword}</p>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <Field
                        id="checkboxCGU"
                        validate={(v) => (!v || v === "false") && requiredMessage}
                        type="checkbox"
                        value="true"
                        onChange={(e) => handleChange({ target: { name: "acceptCGU", value: e.target.checked ? "true" : "false" } })}
                        name="acceptCGU"
                        checked={values.acceptCGU === "true"}
                        className="rounded border-brand-grey text-brand-purple focus:ring-offset-0"
                      />
                      <label htmlFor="checkboxCGU" className="mb-0 flex-1 text-brand-grey">
                        J&apos;ai lu et j&apos;accepte les{" "}
                        <a
                          href={`${adminURL}/conditions-generales-utilisation`}
                          target="_blank"
                          className="text-snu-purple-200 transition-colors hover:text-snu-purple-600 hover:underline"
                          rel="noreferrer">
                          conditions générales d&apos;utilisation{" "}
                        </a>
                        de la plateforme du Service national universel
                      </label>
                    </div>
                    <p className="text-xs text-red-500">{errors.acceptCGU}</p>
                  </div>
                  <LoadingButton
                    className="block cursor-pointer !rounded-xl border-0 bg-brand-purple py-2 px-5 text-base font-medium text-white transition-colors"
                    loading={isSubmitting}
                    type="submit">
                    Activer mon compte
                  </LoadingButton>
                  <div className="col-span-2 border-t border-gray-200 pt-6 text-sm text-brand-grey">
                    Vous avez déjà un compte ?{" "}
                    <Link to="/auth/signin" className="text-snu-purple-200 transition-colors hover:text-snu-purple-600 hover:underline">
                      Connectez-vous
                    </Link>
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
