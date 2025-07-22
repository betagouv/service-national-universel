import { Field, Formik } from "formik";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import validator from "validator";

import { HiOutlineMailOpen } from "react-icons/hi";

import API from "../../services/api";

export default () => {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="flex flex-1 justify-center">
        <div className=" h-6/12  min-h-[400px] w-6/12 bg-snu-purple-600 bg-[url('./assets/computer.jpeg')] bg-cover bg-center bg-no-repeat " />
        <div className="lg:py-30 py-14 md:py-20">
          <div className="mx-auto w-11/12 rounded-2xl bg-white p-10 text-center shadow-base md:w-2/3 lg:w-1/2">
            <HiOutlineMailOpen className="text-royalblue-300 mx-auto mb-6 w-10 text-center text-3xl" />
            <h4 className="mb-2 w-full text-xl font-bold text-black">Regardez vos emails</h4>
            <p className="mb-6 w-full text-sm text-gray-400">Nous avons envoyé des instructions de récupération de mot de passe sur votre email.</p>
            <p className="mb-6 w-full text-sm leading-7 text-gray-400">
              Vous n'avez pas reçu votre email ? Regardez dans vos spams ou
              <br />
              <span className="text-royalblue-600 cursor-pointer font-semibold" onClick={() => setDone(false)}>
                essayez une autre adresse mail.
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 justify-center">
        <div className=" h-6/12  min-h-[400px] w-6/12 bg-snu-purple-600 bg-[url('./assets/computer.jpeg')] bg-cover bg-center bg-no-repeat " />

        <div className="flex flex-1 flex-col justify-center bg-gray-50 p-8">
          <h4 className="mb-6 w-full text-center text-xl font-bold text-black">Réinitialiser le mot de passe</h4>
          <p className="mb-6 w-full text-center text-sm text-gray-500">Entrez votre email pour recevoir un lien de réinitialisation de votre mot de passe</p>
          <Formik
            initialValues={{ email: "" }}
            validateOnMount
            onSubmit={async (values, actions) => {
              try {
                const { ok, code } = await API.post({ path: "/agent/forgot_password", body: values });
                if (!ok) throw { code: code || "ERROR" };
                toast.success("Sent");
                setDone(true);
              } catch (e) {
                toast.error(e.code);
              }
              actions.setSubmitting(false);
            }}
          >
            {({ values, isSubmitting, handleChange, handleSubmit, isValid }) => {
              return (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="input-label">Email</label>
                      <Field
                        validate={(v) => !validator.isEmail(v) && "Invalid email address"}
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Entrez votre email"
                      />
                    </div>
                    <button type="submit" disabled={isSubmitting || !isValid} className="auth-button-primary">
                      Envoyez-moi un lien
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
