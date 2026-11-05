import Img3 from "../../assets/logo-snu.png";
import Img2 from "../../assets/auth.png";
import React, { useState } from "react";
import { Formik } from "formik";
import queryString from "query-string";
import { toastr } from "react-redux-toastr";
import { Redirect } from "react-router-dom";

import api from "../../services/api";
import LoadingButton from "../../components/buttons/LoadingButton";
import PasswordEye from "../../components/PasswordEye";
import { ERRORS } from "snu-lib";
import { translate } from "../../utils";

export default function ResetPassword({ location }) {
  const [redirect, setRedirect] = useState(false);

  return (
    <div className="flex flex-1 overflow-x-hidden">
      <div className="flex flex-1 flex-col p-8">
        <div className="mx-auto max-w-lg">
          <div className="mb-10">
            <img src={Img3} className="h-10 py-1 px-4 md:h-20" />
          </div>
          <h1 className="mb-4 text-xl font-bold text-brand-black md:text-3xl">Créer un nouveau mot de passe</h1>
          <Formik
            initialValues={{ password: "" }}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={async ({ password }, actions) => {
              try {
                const { token } = queryString.parse(location.search);
                const res = await api.post("/referent/forgot_password_reset", { password, token });
                if (!res.ok) throw res;
                toastr.success("Mot de passe créé");
                setRedirect(true);
              } catch (e) {
                // Le bouton restait bloqué en chargement après un refus : setSubmitting n'était jamais rappelé.
                actions.setSubmitting(false);
                if (e?.code === ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID) {
                  return toastr.error(
                    "Ce lien n'est plus valable",
                    "Il est valable 2 heures et ne sert qu'une fois. Chaque nouvelle demande remplace le lien précédent : utilisez le dernier e-mail reçu, ou demandez un nouveau lien.",
                    { timeOut: 15000 },
                  );
                }
                return toastr.error(translate(e && e.code), "", { timeOut: 15000 });
              }
              actions.setSubmitting(false);
            }}>
            {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
              return (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {redirect && <Redirect to="/" />}
                  <div>
                    <label className="mb-2 inline-block text-xs font-medium uppercase text-brand-grey">Mot de passe</label>
                    <PasswordEye autoComplete="new-password" value={values.password} onChange={handleChange} />
                    <p className="text-xs text-red-500">{errors.password}</p>
                    <p className="mt-2 text-sm font-medium text-brand-grey">
                      👉 Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole, et être différent de l&apos;ancien
                    </p>
                  </div>
                  <LoadingButton
                    className="block w-max cursor-pointer rounded-md border-0 bg-brand-purple py-3 px-10 text-base font-medium text-white transition-colors hover:bg-brand-darkPurple"
                    loading={isSubmitting}
                    type="submit"
                    disabled={isSubmitting}>
                    Créer
                  </LoadingButton>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
      <div className="flex-1 bg-blue-50">
        <div className="flex h-full flex-col items-center justify-center">
          <h1 className="mb-4 text-xl font-bold text-brand-black text-blue-600 md:text-3xl">Plateforme du Service National Universel</h1>
          <img className="max-w-[280px]" src={Img2} />
        </div>
      </div>
    </div>
  );
}
