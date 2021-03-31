import React, { useState } from "react";
import { Formik } from "formik";
import { Link, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import queryString from "query-string";

import { setYoung } from "../../redux/auth/actions";
import LoginBox from "./components/LoginBox";
import api from "../../services/api";
import matomo from "../../services/matomo";
import Header from "./components/header";
import Title from "./components/Title";
import InputField from "./components/InputField";
import StyledFormGroup from "./components/StyledFormGroup";
import Forgot from "./components/Forgot";
import Submit from "./components/Submit";
import Register from "./components/Register";
import ErrorLogin from "./components/ErrorLogin";

export default () => {
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);
  const [userIsValid, setUserIsValid] = useState(true);
  const params = queryString.parse(location.search);
  const { redirect } = params;

  if (young) return <Redirect to={"/" + (redirect || "")} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <LoginBox>
        <Title>
          <span>Mon espace volontaire</span>
        </Title>
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={async (values, actions) => {
            try {
              const { user: young, token } = await api.post(`/young/signin`, values);
              if (token) api.setToken(token);
              if (young) {
                dispatch(setYoung(young));
                matomo.setUserId(young._id);
                window.lumiere("registerUser", young._id);
              }
            } catch (e) {
              console.log("e", e);
              setUserIsValid(false);
            }
            actions.setSubmitting(false);
          }}
        >
          {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
            return (
              <form onSubmit={handleSubmit}>
                {!userIsValid && (
                  <StyledFormGroup>
                    <ErrorLogin>Identifiant incorrect </ErrorLogin>
                  </StyledFormGroup>
                )}

                <StyledFormGroup>
                  <div>
                    <InputField
                      // validate={(v) => !validator.isEmail(v) && "Invalid email address"}
                      name="email"
                      type="email"
                      id="email"
                      placeholder="Adresse e-mail"
                      value={values.email}
                      onChange={handleChange}
                    />
                    <label htmlFor="email">E-mail</label>
                  </div>
                  <p style={{ fontSize: 12, color: "rgb(253, 49, 49)", marginTop: 5 }}>{errors.email}</p>
                </StyledFormGroup>
                <StyledFormGroup>
                  <div>
                    <InputField
                      // validate={(v) => validator.isEmpty(v) && "This field is Required"}
                      name="password"
                      type="password"
                      id="password"
                      placeholder="Votre mot de passe"
                      value={values.password}
                      onChange={handleChange}
                    />
                    <label htmlFor="password">Mot de passe</label>
                  </div>
                  <p style={{ fontSize: 12, color: "rgb(253, 49, 49)", marginTop: 5 }}>{errors.password}</p>
                </StyledFormGroup>
                <Forgot>
                  <Link to="/auth/forgot">Mot de passe perdu ?</Link>
                </Forgot>
                <Submit loading={isSubmitting} type="submit">
                  Connexion
                </Submit>
              </form>
            );
          }}
        </Formik>
        <Title>
          <span>Vous n'êtes pas encore inscrit ?</span>
        </Title>
        <Register to="/inscription/profil">Commencer l'inscription</Register>
      </LoginBox>
    </div>
  );
};
