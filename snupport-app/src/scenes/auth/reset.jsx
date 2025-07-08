import { Field, Formik } from "formik";
import queryString from "query-string";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

import { Redirect } from "react-router-dom";

import API from "../../services/api";

export default ({ location }) => {
  const [redirect, setRedirect] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:py-30 py-14 md:py-20">
        <div className="mx-auto w-11/12 rounded-2xl bg-white p-10 shadow-base md:w-2/3 lg:w-1/2">
          <h4 className="mb-6 w-full text-center text-xl font-bold text-black">Créez le nouveau mot de passe</h4>

          {redirect && <Redirect to="/" />}
          <Formik
            initialValues={{ password: "", passwordConfirm: "" }}
            onSubmit={async (values, actions) => {
              try {
                const { password, passwordConfirm } = values;
                if (password !== passwordConfirm) {
                  toast.error("Les mots de passe ne sont pas identiques !");
                  actions.setSubmitting(false);
                  return;
                }
                const { token } = queryString.parse(location.search);
                const res = await API.post({ path: "/agent/forgot_password_reset", body: { password, passwordConfirm, token } });
                if (!res.ok) throw res;
                toast.success("Mot de passe modifié !");
                setRedirect(true);
              } catch (e) {
                console.log("e", e);
                toast.error(e.message || e.error || e.code);
              }
              actions.setSubmitting(false);
            }}
          >
            {({ values, isSubmitting, handleChange, handleSubmit }) => {
              return (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="input-label">Mot de passe</label>
                      <Field name="password" type="password" value={values.password} onChange={handleChange} className="input-field" placeholder="Entrez le nouveau mot de passe" />
                    </div>
                    <div>
                      <label className="input-label">Répétez le mot de passe</label>
                      <Field
                        name="passwordConfirm"
                        type="password"
                        value={values.passwordConfirm}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Répétez le mot de passe"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mx-auto rounded-lg bg-snu-purple-300 p-3.5 text-sm font-medium text-white transition-all hover:bg-snu-purple-800"
                    >
                      Confirmez le nouveau mot de passe
                    </button>
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
};
