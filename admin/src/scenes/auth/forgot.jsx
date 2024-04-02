import React, { useState } from "react";
import { Formik, Field } from "formik";
import validator from "validator";
import { toastr } from "react-redux-toastr";

import LoadingButton from "../../components/buttons/LoadingButton";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { translate } from "../../utils";
import Header from "./components/header";

export default function Forgot() {
  const [mail, setMail] = useState("");

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Header />
      <div className="flex flex-1 justify-center">
        <div className="hidden min-h-[400px] flex-[1] bg-[url('./assets/computer.jpeg')] bg-cover bg-center bg-no-repeat md:block" />
        <div className="flex flex-1 flex-col justify-center bg-gray-50 p-8">
          <Formik
            initialValues={{ email: "" }}
            onSubmit={async ({ email }, actions) => {
              try {
                await api.post("/referent/forgot_password", { email });
                setMail(email);
              } catch (e) {
                toastr.error("Erreur !", translate(e.code));
              }
              actions.setSubmitting(false);
            }}>
            {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
              return (
                <form onSubmit={handleSubmit} className="mb-6 flex flex-col items-start gap-4">
                  {mail ? (
                    <>
                      <h1 className="mb-4 mb-0 text-xl font-bold text-brand-black md:text-3xl">Email envoyé à : «&nbsp;{mail}&nbsp;»</h1>
                      <h2 className="mb-8 mb-0 text-base font-normal text-brand-grey">
                        Si vous possedez un compte chez nous, un email contenant les instructions pour réinitialiser votre mot de passe vient de vous être envoyé.
                      </h2>
                      <h2 className="mb-8 mb-4 text-base font-normal text-brand-grey">
                        Si vous ne vous souvenez plus de votre email de connexion, écrivez-nous à{" "}
                        <a href="mailto:contact@snu.gouv.fr" className="text-snu-purple-200 transition-colors hover:text-snu-purple-600 hover:underline">
                          contact@snu.gouv.fr
                        </a>
                        .
                      </h2>
                    </>
                  ) : (
                    <>
                      <h1 className="mb-4 mb-0 text-xl font-bold text-brand-black md:text-3xl">Réinitialisation du mot de passe</h1>
                      <h2 className="mb-8 mb-4 text-base font-normal text-brand-grey">
                        Pour réinitialiser votre mot de passe, entrez l&apos;adresse mail que vous avez utilisée pour vous connecter à la plateforme
                      </h2>
                      <div className="self-stretch">
                        <div>
                          <label className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">ADRESSE EMAIL</label>
                          <Field
                            className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                            validate={(v) => !validator.isEmail(v) && "Veuillez renseigner votre email"}
                            name="email"
                            type="email"
                            value={values.email}
                            placeholder="Email"
                            onChange={handleChange}
                            hasError={errors.email}
                          />
                        </div>
                        <p className="text-xs text-red-500">{errors.email}</p>
                      </div>
                      <LoadingButton
                        className="block cursor-pointer !rounded-xl border-0 bg-brand-purple py-2 px-5 text-base font-medium text-white transition-colors"
                        type="submit"
                        loading={isSubmitting}>
                        Obtenir le lien de réinitialisation par email
                      </LoadingButton>
                    </>
                  )}
                </form>
              );
            }}
          </Formik>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-center text-sm text-brand-grey">
              Vous avez déjà un compte ?{" "}
              <Link to="/auth" className="text-snu-purple-200 transition-colors hover:text-snu-purple-600 hover:underline">
                Connectez vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
