import React, { useEffect, useState } from "react";
import { FormGroup } from "reactstrap";
import { Formik, Field } from "formik";
import validator from "validator";
import { Link, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";

import { setYoung } from "../../redux/auth/actions";

import api from "../../services/api";
import matomo from "../../services/matomo";
import LoadingButton from "../../components/loadingButton";
import Header from "./components/header";

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

  let title;
  if (newuser.department && newuser.role === "referent_department") {
    title = `Activez votre compte de Référent du département : ${newuser.department}`;
  } else {
    title = "Activez votre compte";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <AuthWrapper>
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
        </LoginBox>
      </AuthWrapper>
    </div>
  );
};

const AuthWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-grow: 2;
  position: relative;
  background: url(${require("../../assets/login.jpg")}) center no-repeat;
  background-size: cover;
  ::after {
    content: "";
    display: block;
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: rgba(63, 54, 148, 0.95);
    z-index: 1;
  }
  > * {
    position: relative;
    z-index: 2;
  }
`;

const Title = styled.h2`
  position: relative;
  text-align: center;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  font-weight: 700;
  margin-bottom: 20px;
  ::after {
    content: "";
    display: block;
    height: 1px;
    width: 100%;
    background-color: #d2d6dc;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: -1;
  }
  span {
    padding: 0 10px;
    background-color: #fff;
    color: rgb(22, 30, 46);
  }
`;

const LoginBox = styled.div`
  max-width: 450px;
  width: 100%;
  padding: 40px 30px 20px;
  border-radius: 8px;
  margin: auto;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  @media (max-width: 768px) {
    border-radius: 0;
    margin: 0;
  }
`;

const StyledFormGroup = styled(FormGroup)`
  margin-bottom: 20px;
  div {
    display: flex;
    flex-direction: column-reverse;
  }
  label {
    color: #37415b;
    font-size: 14px;
    margin-bottom: 5px;
    cursor: pointer;
  }
`;
const InputField = styled(Field)`
  background-color: transparent;
  outline: 0;
  display: block;
  width: 100%;
  padding: 12px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  color: #798fb0;
  -webkit-transition: border 0.2s ease;
  transition: border 0.2s ease;
  line-height: 1.2;
  ::placeholder {
    color: #798fb0;
  }
  &:focus {
    outline: none;
    border: 1px solid rgba(66, 153, 225, 0.5);
    & + label {
      color: #434190;
    }
    ::placeholder {
      color: #ccd5e0;
    }
  }
`;
const Forgot = styled.div`
  margin-bottom: 20px;
  a {
    color: #5145cd;
    font-size: 14px;
  }
`;

const Submit = styled(LoadingButton)`
  width: 100%;
  display: block;
  font-size: 18px;
  font-weight: 700;
  border-radius: 0;
  padding: 12px;
  border: 0;
  background-color: #5145cd;
  margin-top: 30px;
  margin-bottom: 30px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
  cursor: pointer;
  :hover {
    background-color: #42389d;
  }
  :focus {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
  }
`;

const Register = styled(Link)`
  width: 100%;
  display: block;
  font-size: 18px;
  font-weight: 700;
  border-radius: 0;
  padding: 12px;
  border: 0;
  background-color: #fff;
  margin-top: 20px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  color: #000;
  text-align: center;
  cursor: pointer;
  :hover {
    background-color: #f4f5f7;
    color: #000;
  }
`;
const ErrorLogin = styled.div`
  background-color: #fff5f5;
  display: block;
  width: 100%;
  padding: 15px;
  margin-top: 3px;
  margin-bottom: 0;
  border: 1px solid #fc8180;
  color: #c73738;
  line-height: 1.2;
  border-radius: 5px;
`;
