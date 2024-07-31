import React from "react";
import { Formik, Field } from "formik";
import validator from "validator";
import { toastr } from "react-redux-toastr";

import Header from "./components/header";

import api from "../../services/api";
import LoadingButton from "../../components/buttons/LoadingButton";
import { translate } from "snu-lib";
import { classNames } from "../../utils";

export default function InvitationExpired() {
  const urlParams = new URLSearchParams(window.location.search);

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <div className="flex flex-1 justify-center">
        <div className="hidden min-h-[400px] flex-1 bg-[url('./assets/rang.jpg')] bg-cover bg-center bg-no-repeat md:block" />
        <div className="flex flex-1 flex-col justify-center bg-gray-50 p-8">
          <h1 className="mb-4 text-xl font-bold text-brand-black md:text-3xl">Votre lien d&apos;invitation a expiré</h1>
          <Formik
            initialValues={{ email: urlParams.get("email") || "" }}
            onSubmit={async (values, actions) => {
              try {
                const { ok, code } = await api.post(`/referent/signup_retry`, values);
                if (!ok) return toastr.error("Erreur !", translate(code));
                toastr.success("Email envoyé");
              } catch (e) {
                toastr.error("Erreur !", translate(e.code));
              }
              actions.setSubmitting(false);
            }}>
            {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
              return (
                <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
                  <div>
                    <label className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">Adresse Email</label>
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
                  <LoadingButton
                    className="block w-max cursor-pointer rounded-md border-0 bg-brand-purple py-3 px-10 text-base font-medium text-white transition-colors hover:bg-brand-darkPurple"
                    loading={isSubmitting}
                    type="submit"
                    color="primary">
                    Cliquez ici pour recevoir une nouvelle invitation valide
                  </LoadingButton>

                  <div className="flex gap-2 border-t border-gray-200 pt-4">
                    <p className="text-center text-sm font-medium text-brand-grey">
                      Si le problème persiste, ou si vous ne recevez pas de mail, contactez nous sur{" "}
                      <a href="mailto:contact@snu.gouv.fr" className="font-medium text-snu-purple-200 transition-colors hover:text-snu-purple-600">
                        contact@snu.gouv.fr
                      </a>
                    </p>
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
