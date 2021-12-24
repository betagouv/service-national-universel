import React, { useState } from "react";
import { Formik } from "formik";
import { Link, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import queryString from "query-string";

import { setYoung } from "../../redux/auth/actions";
import LoginBox from "./components/LoginBox";
import api from "../../services/api";
import Header from "./components/header";
import Title from "./components/Title";
import InputField from "./components/InputField";
import StyledFormGroup from "./components/StyledFormGroup";
import Forgot from "./components/Forgot";
import Submit from "./components/Submit";
import Register from "./components/Register";
import ErrorLogin from "./components/ErrorLogin";
import ModalInProgress from "../../components/modals/ModalInProgress";
import { toastr } from "react-redux-toastr";

/*

About Redirect after signin

we use this signin screen in the `app`, but also outside the app in `knowledge-base` which is not in the same origin

-> signin and redirect within the app would be an url like http://localhost:8081/auth?redirect=/my-page
|-> redirection is made with `if (young) return <Redirect to={"/" + (redirect || "")} />;`

-> signin and redirect outside the app would be an url like http://localhost:8081/auth?redirect=http(s)://localhost:8083/
|-> redirection is made with `if (redirect.startsWith('http')) return window.location.href = redirect;`

*/

export default function Signin() {
  const [modal, setModal] = useState(null);
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);
  const [userIsValid, setUserIsValid] = useState(true);
  const [tooManyRequests, settooManyRequests] = useState(false);
  const params = queryString.parse(location.search);
  const { redirect, disconnected } = params;

  if (young) return <Redirect to={"/" + (redirect || "")} />;
  if (disconnected === "1") toastr.error("Votre session a expiré", "Merci de vous reconnecter.", { timeOut: 10000 });

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {modal === "inProgress" && (
        <ModalInProgress
          onChange={() => setModal(false)}
          cb={() => {
            setModal(false);
          }}
        />
      )}
      <Header />
      <LoginBox>
        <Title>
          <span>Mon espace volontaire</span>
        </Title>
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={async ({ email, password }, actions) => {
            try {
              const { user: young, token } = await api.post(`/young/signin`, { email, password });
              if (young) {
                if (redirect.startsWith('http')) return window.location.href = redirect;
                if (token) api.setToken(token);
                dispatch(setYoung(young));
              }
            } catch (e) {
              console.log("e", e);
              setUserIsValid(false);
              if (e.code === "TOO_MANY_REQUESTS") {
                settooManyRequests(true);
              }
            }
            actions.setSubmitting(false);
          }}>
          {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
            return (
              <form onSubmit={handleSubmit}>
                {!userIsValid && (
                  <StyledFormGroup>
                    <ErrorLogin>E-mail et/ou mot de passe incorrect(s)</ErrorLogin>
                  </StyledFormGroup>
                )}
                {tooManyRequests && (
                  <StyledFormGroup>
                    <ErrorLogin>Vous avez atteint le maximum de tentatives de connexion autorisées. Réessayez dans une heure. </ErrorLogin>
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
        <>
          <Title>
            <span>Vous n&apos;êtes pas encore inscrit ?</span>
          </Title>
          <Register to="/inscription/profil">Commencer l&apos;inscription</Register>
        </>
      </LoginBox>
    </div>
  );
}
