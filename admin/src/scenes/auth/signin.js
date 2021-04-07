import React, { useState } from "react";
import { FormGroup } from "reactstrap";
import { Formik, Field } from "formik";
import { Link, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";

import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
import LoadingButton from "../../components/buttons/LoadingButton";
import Header from "./components/header";
import matomo from "../../services/matomo";

export default () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);
  const [userIsValid, setUserIsValid] = useState(true);

  if (user) return <Redirect to="/" />;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Header />
      <AuthWrapper>
        <Thumb />
        <div>
          <LoginBox>
            <div>
              <Title>Espace Administrateur</Title>
              <Subtitle>A destination des référents et des structures d’accueil</Subtitle>
              <Formik
                initialValues={{ email: "", password: "" }}
                onSubmit={async (values, actions) => {
                  try {
                    const { user, token } = await api.post(`/referent/signin`, values);
                    if (token) api.setToken(token);
                    if (user) {
                      dispatch(setUser(user));
                      matomo.setUserId(user._id);
                      window.lumiere("registerUser", user._id);
                    }
                  } catch (e) {
                    if (e && ["EMAIL_OR_PASSWORD_INVALID", "USER_NOT_EXISTS", "EMAIL_AND_PASSWORD_REQUIRED"].includes(e.code)) {
                      return setUserIsValid(false);
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
                          <ErrorLogin>Identifiant incorrect </ErrorLogin>
                        </StyledFormGroup>
                      )}

                      <StyledFormGroup>
                        <div>
                          <label htmlFor="email">E-mail</label>
                          <InputField
                            // validate={(v) => !validator.isEmail(v) && "Invalid email address"}
                            className="form-control"
                            name="email"
                            type="email"
                            id="email"
                            placeholder="Adresse e-mail"
                            value={values.email}
                            onChange={handleChange}
                          />
                        </div>
                        <p style={{ fontSize: 12, color: "rgb(253, 49, 49)", marginTop: 5 }}>{errors.email}</p>
                      </StyledFormGroup>
                      <StyledFormGroup>
                        <div>
                          <label htmlFor="password">Mot de passe</label>
                          <InputField
                            // validate={(v) => validator.isEmpty(v) && "This field is Required"}
                            className="form-control"
                            name="password"
                            type="password"
                            id="password"
                            placeholder="Votre mot de passe"
                            value={values.password}
                            onChange={handleChange}
                          />
                        </div>
                        <p style={{ fontSize: 12, color: "rgb(253, 49, 49)", marginTop: 5 }}>{errors.password}</p>
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
        </div>
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

const AuthWrapper = styled.div`
  display: flex;
  width: 100%;
  > * {
    flex: 1;
  }
`;

const Title = styled.h1`
  position: relative;
  font-size: 2rem;
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
  font-weight: 700;
  margin-bottom: 14px;
`;

const Subtitle = styled.h2`
  position: relative;
  font-size: 1rem;
  color: #6e757c;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  font-weight: 400;
  margin-bottom: 20px;
`;

const Register = styled.h3`
  position: relative;
  font-size: 1rem;
  text-align: center;
  color: #6e757c;
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

const LoginBox = styled.div`
  padding: 4rem;
  background-color: #f6f6f6;
  @media (max-width: 768px) {
    border-radius: 0;
    margin: 0;
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
  display: block;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 0;
  padding: 0.5rem 3rem;
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
