import React, { useState } from "react";
import { Formik } from "formik";
import { toastr } from "react-redux-toastr";
import { Redirect } from "react-router-dom";
import PasswordEye from "../../components/PasswordEye";
import queryString from "query-string";

import api from "../../services/api";
import Header from "./components/header";
import { translate } from "../../utils";
import Title from "./components/Title";
import StyledFormGroup from "./components/StyledFormGroup";
import Submit from "./components/Submit";
import Register from "./components/Register";
import LoginBox from "./components/LoginBox";
import Subtitle from "./components/Subtitle";

export default () => {
  const [redirect, setRedirect] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {redirect && <Redirect to="/auth" />}
      <Header />
      <LoginBox>
        <Title>
          <span>Mon espace volontaire</span>
        </Title>
        <Subtitle>Récupérer mon mot de passe</Subtitle>
        <Formik
          initialValues={{ password: "" }}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (values, actions) => {
            try {
              const { token } = queryString.parse(location.search);
              const res = await api.post("/young/forgot_password_reset", { ...values, token });
              if (!res.ok) throw res;
              toastr.success("Mot de passe changé avec succès");
              setRedirect(true);
            } catch (e) {
              return toastr.error("Une erreur s'est produite :", translate(e && e.code));
            }
            actions.setSubmitting(false);
          }}
        >
          {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
            return (
              <form onSubmit={handleSubmit}>
                {redirect && <Redirect to="/" />}
                <StyledFormGroup>
                  <label>Mot de passe</label>
                  <PasswordEye value={values.password} onChange={handleChange} />
                  <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.password}</p>
                  <p>👉 Il doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un symbole</p>
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
        <Title>
          <span>Retourner à la connexion</span>
        </Title>
        <Register to="/auth/signin">Se connecter</Register>
      </LoginBox>
    </div>
  );
};
