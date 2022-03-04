import React, { useState } from "react";
import { Formik } from "formik";
import { toastr } from "react-redux-toastr";
import { Redirect } from "react-router-dom";
import PasswordEye from "../../components/PasswordEye";
import queryString from "query-string";

import api from "../../services/api";
import Header from "./components/header";
import { translate } from "../../utils";
import StyledFormGroup from "./components/StyledFormGroup";
import Submit from "./components/Submit";
import Register from "./components/Register";
import LoginBox from "./components/LoginBox";

export default function Reset() {
  const [redirect, setRedirect] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {redirect && <Redirect to="/auth" />}
      <Header />
      <LoginBox>
        <h3 className="relative text-center md:text-base text-xs font-bold mb-3 px-2.5 bg-white text-coolGray-900 left-0">
          <span>Mon espace volontaire</span>
        </h3>
        <h2 className="text-center md:text-xl text-base font-medium mb-5 ">Réinitialiser mon mot de passe</h2>
        <Formik
          initialValues={{ password: "" }}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async ({ password }, actions) => {
            try {
              const { token } = queryString.parse(location.search);
              const res = await api.post("/young/forgot_password_reset", { password, token });
              if (!res.ok) throw res;
              toastr.success("Mot de passe changé avec succès");
              setRedirect(true);
            } catch (e) {
              return toastr.error("Une erreur s'est produite :", translate(e && e.code));
            }
            actions.setSubmitting(false);
          }}>
          {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
            return (
              <form onSubmit={handleSubmit}>
                {redirect && <Redirect to="/" />}
                <StyledFormGroup>
                  <label>Mot de passe</label>
                  <PasswordEye value={values.password} onChange={handleChange} />
                  <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.password}</p>
                  <p>👉 Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole</p>
                </StyledFormGroup>
                <div className="button">
                  <Submit loading={isSubmitting} type="submit" color="primary" disabled={isSubmitting}>
                    Confirmer
                  </Submit>
                </div>
              </form>
            );
          }}
        </Formik>
        <h3 className="relative text-center md:text-base text-xs font-bold pt-3 px-2.5 bg-white text-coolGray-900 left-0 border-t">
          <span>Retourner à la connexion</span>
        </h3>
        <Register to="/auth/signin">Se connecter</Register>
      </LoginBox>
    </div>
  );
}
