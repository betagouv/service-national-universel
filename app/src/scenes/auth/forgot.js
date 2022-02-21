import React, { useState } from "react";
import { Formik } from "formik";
import classnames from "classnames";
import validator from "validator";
import { toastr } from "react-redux-toastr";

import api from "../../services/api";
import Header from "./components/header";
import { translate } from "../../utils";
import InputField from "./components/InputField";
import StyledFormGroup from "./components/StyledFormGroup";
import Submit from "./components/Submit";
import Register from "./components/Register";
import LoginBox from "./components/LoginBox";
import Text from "./components/Text";

export default function Forgot() {
  const [done, setDone] = useState(false);
  const [mail, setMail] = useState();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <LoginBox>
        <h2 class="relative text-center md:text-base text-xs font-bold mb-5 px-2.5 bg-white text-coolGray-900 left-0 border-b">
          <span>Mon espace volontaire</span>
        </h2>

        {done ? (
          <>
            <h2 class="text-center md:text-xl text-base font-medium mb-5 ">Un email de réinitialisation de mot de passe vous a été envoyé !</h2>
            <h2 class="text-center md:text-xl text-base font-medium mb-5 ">
              <span>{mail}</span>
            </h2>
            <Text>
              Cet email contient un lien permettant de réinitialiser votre mot de passe.
              <br />
              Vous allez le recevoir d&apos;ici quelques minutes, pensez à vérifier vos spams et courriers indésirables.
            </Text>
          </>
        ) : (
          <>
            <h2 class="text-center md:text-xl text-base font-medium mb-5 ">Réinitialiser mon mot de passe</h2>

            <Formik
              initialValues={{ email: "" }}
              onSubmit={async ({ email }, actions) => {
                try {
                  await api.post("/young/forgot_password", { email });
                  toastr.success("E-mail envoyé !");
                  setMail(email);
                  setDone(true);
                } catch (e) {
                  toastr.error("Erreur !", translate(e.code));
                }
                actions.setSubmitting(false);
              }}>
              {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
                return (
                  <form onSubmit={handleSubmit}>
                    <StyledFormGroup>
                      <div>
                        <InputField
                          validate={(v) => !validator.isEmail(v) && "format incorrect"}
                          className={classnames({ "has-error": errors.email })}
                          name="email"
                          type="email"
                          id="email"
                          value={values.email}
                          onChange={handleChange}
                          placeholder="Adresse e-mail"
                        />
                        <label htmlFor="email">E-mail</label>
                      </div>
                      <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.email}</p>
                    </StyledFormGroup>
                    <Submit type="submit" color="success" loading={isSubmitting}>
                      M&apos;envoyer le lien de réinitialisation
                    </Submit>
                  </form>
                );
              }}
            </Formik>
          </>
        )}
        <h2 class="relative text-center md:text-base text-xs font-bold mb-5 px-2.5 bg-white text-coolGray-900 left-0 border-b">
          <span>Retourner à la connexion</span>
        </h2>
        <Register to="/auth/signin">Se connecter</Register>
      </LoginBox>
    </div>
  );
}
