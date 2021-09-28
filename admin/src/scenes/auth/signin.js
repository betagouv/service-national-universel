import React, { useState } from "react";
import { FormGroup } from "reactstrap";
import { Formik, Field } from "formik";
import { Link, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import queryString from "query-string";

import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
import LoadingButton from "../../components/buttons/LoadingButton";
import LoginBox from "./components/loginBox";
import Header from "./components/header";
import AuthWrapper from "./components/authWrapper";
import Title from "./components/title";
import Subtitle from "./components/subtitle";
import { colors } from "../../utils";
import PasswordEye from "../../components/PasswordEye";

export default () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);
  const [userIsValid, setUserIsValid] = useState(true);
  const [tooManyRequests, settooManyRequests] = useState(false);
  const params = queryString.parse(location.search);
  const { redirect, unauthorized } = params;

  if (user) return <Redirect to={"/" + (redirect || "")} />;
  if (unauthorized === "1") toastr.error("Votre session a expiré", "Merci de vous reconnecter.", { timeOut: 10000 });

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Header />
      <AuthWrapper>
        <Thumb />
        <LoginBox style={{ justifyContent: "center" }}>
          <div>
            <Title>Espace Administrateur</Title>
            <Subtitle>A destination des référents et des structures d’accueil</Subtitle>
            <Formik
              initialValues={{ email: "", password: "" }}
              onSubmit={async ({ email, password }, actions) => {
                try {
                  const { user, token } = await api.post(`/referent/signin`, { email, password });
                  if (token) api.setToken(token);
                  if (user) {
                    dispatch(setUser(user));
                  }
                } catch (e) {
                  console.log("ERROR", e);
                  if (e && ["EMAIL_OR_PASSWORD_INVALID", "USER_NOT_EXISTS", "EMAIL_AND_PASSWORD_REQUIRED"].includes(e.code)) {
                    return setUserIsValid(false);
                  }
                  if (e.code === "TOO_MANY_REQUESTS") {
                    settooManyRequests(true);
                  }
                  toastr.error("Erreur détectée");
                }
                actions.setSubmitting(false);
              }}
            >
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
                        <label htmlFor="email">E-mail</label>
                        <InputField
                          autoComplete="username"
                          className="form-control"
                          name="email"
                          type="email"
                          id="email"
                          placeholder="Adresse e-mail"
                          value={values.email}
                          onChange={handleChange}
                        />
                      </div>
                    </StyledFormGroup>
                    <StyledFormGroup>
                      <label htmlFor="password">Mot de passe</label>
                      <PasswordEye autoComplete="current-password" value={values.password} onChange={handleChange} showError={false} />
                    </StyledFormGroup>
                    <Forgot>
                      <Link to="/auth/forgot">Mot de passe perdu ?</Link>
                    </Forgot>
                    <Submit loading={isSubmitting} type="submit">
                      Se connecter
                    </Submit>
                  </form>
                );
              }}
            </Formik>
          </div>
          <div>
            <hr />
            <Register>
              Vous êtes une structure ? <Link to="/auth/signup">Publiez vos missions</Link>
            </Register>
          </div>
        </LoginBox>
      </AuthWrapper>
    </div>
  );
};

const Thumb = styled.div`
  min-height: 400px;
  background: url(${require("../../assets/computer.jpeg")}) no-repeat center;
  background-size: cover;
  flex: 1;
  @media (max-width: 768px) {
    display: none;
  }
`;

const Register = styled.h3`
  position: relative;
  font-size: 1rem;
  text-align: center;
  color: ${colors.grey};
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  font-weight: 400;
  margin-bottom: 20px;
  a {
    color: #32267f;
    font-weight: 500;
  }
`;

const StyledFormGroup = styled(FormGroup)`
  margin-bottom: 25px;
  label {
    color: rgb(106, 111, 133);
    font-size: 10px;
    text-transform: uppercase;
    font-weight: 700;
  }
`;
const InputField = styled(Field)`
  background-color: #fff;
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
    color: #d6d6e1;
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
    color: ${colors.purple};
    font-size: 14px;
  }
`;

const Submit = styled(LoadingButton)`
  display: block;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 0;
  padding: 0.5rem 3rem;
  border: 0;
  background-color: ${colors.purple};
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
