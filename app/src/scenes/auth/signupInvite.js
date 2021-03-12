import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import { Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import { setYoung } from "../../redux/auth/actions";

import api from "../../services/api";
import Header from "./components/header";
import Title from "./components/Title";
import StyledFormGroup from "./components/StyledFormGroup";
import Submit from "./components/Submit";
import LoginBox from "./components/LoginBox";
import InputField from "./components/InputField";

export default () => {
  const [invitation, setInvitation] = useState("");
  const [newuser, setNewUser] = useState(null);

  useEffect(() => {
    (async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const invitationToken = urlParams.get("token");
      if (!invitationToken) return setInvitation("INVITATION_TOKEN_EXPIRED_OR_INVALID");
      const { data: u, code, token } = await api.post(`/young/signup_verify`, { invitationToken });
      if (token) api.setToken(token);
      if (code === "INVITATION_TOKEN_EXPIRED_OR_INVALID") return setInvitation("INVITATION_TOKEN_EXPIRED_OR_INVALID");
      setNewUser(u);
    })();
  }, []);

  const dispatch = useDispatch();

  const young = useSelector((state) => state.Auth.young);

  if (invitation === "INVITATION_TOKEN_EXPIRED_OR_INVALID") return <Redirect to="/auth/invitationexpired" />;
  if (young) return <Redirect to="/" />;

  if (!newuser) return <div>Chargement...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <LoginBox>
        <Title>
          <span>Activer votre espace volontaire</span>
        </Title>
        <Formik
          initialValues={{ firstName: newuser.firstName, lastName: newuser.lastName, email: newuser.email, password: "" }}
          onSubmit={async (values, actions) => {
            try {
              const { data: user, token, code, ok } = await api.post(`/young/signup_invite`, values);
              actions.setSubmitting(false);
              if (!ok) {
                if (code === "PASSWORD_NOT_VALIDATED")
                  return toastr.error(
                    "Mot de passe incorrect",
                    "Votre mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un symbole",
                    { timeOut: 10000 }
                  );
                if (code === "USER_ALREADY_REGISTERED") return toastr.error("Votre compte est déja activé. Veuillez vous connecter", { timeOut: 10000 });
                return toastr.error("Problème", translate(code));
              }
              if (token) api.setToken(token);
              if (user) {
                dispatch(setYoung(user));
              }
            } catch (e) {
              if (e && e.code === "USER_ALREADY_REGISTERED") return toastr.error("Le compte existe déja. Veuillez vous connecter");
              actions.setSubmitting(false);
              console.log("e", e);
            }
          }}
        >
          {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
            return (
              <form onSubmit={handleSubmit}>
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
                <Submit loading={isSubmitting} type="submit">
                  Connexion
                </Submit>
              </form>
            );
          }}
        </Formik>
      </LoginBox>
    </div>
  );
};
