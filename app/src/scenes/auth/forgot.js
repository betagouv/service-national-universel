import React, { useState } from "react";
import { FormGroup } from "reactstrap";
import { Formik, Field } from "formik";
import styled from "styled-components";
import classnames from "classnames";
import validator from "validator";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";

import api from "../../services/api";
import LoadingButton from "../../components/loadingButton";
import Header from "./components/header";
import { translate } from "../../utils";

export default () => {
  const [done, setDone] = useState(false);
  const [mail, setMail] = useState();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <AuthWrapper>
        <LoginBox>
          <Title>
            <span>Mon espace volontaire</span>
          </Title>

          {done ? (
            <>
              <Subtitle>Un email de réinitialisation de mot de passe vous a été envoyé !</Subtitle>
              <Subtitle>
                <span>{mail}</span>
              </Subtitle>
              <Description>Cet e-mail contient un lien permettant de réinitialiser ton mot de passe.</Description>
            </>
          ) : (
            <>
              <Subtitle>Récupérer mon mot de passe</Subtitle>

              <Formik
                initialValues={{ email: "" }}
                onSubmit={async (values, actions) => {
                  try {
                    await api.post("/young/forgot_password", values);
                    toastr.success("E-mail envoyé !");
                    setMail(values.email);
                    setDone(true);
                  } catch (e) {
                    toastr.error("Erreur !", translate(e.code));
                  }
                  actions.setSubmitting(false);
                }}
              >
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
                          />
                          <label htmlFor="email">Ton e-mail</label>
                        </div>
                        <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.email}</p>
                      </StyledFormGroup>
                      <Submit type="submit" color="success" loading={isSubmitting}>
                        Recevoir mon mot de passe
                      </Submit>
                    </form>
                  );
                }}
              </Formik>
            </>
          )}
          <Title>
            <span>Retourner à la connexion</span>
          </Title>
          <Register to="/auth/signin">Se connecter</Register>
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

const Subtitle = styled.h2`
  text-align: center;
  font-size: 1.2rem;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  font-weight: 500;
  margin-bottom: 20px;
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
const Description = styled.p`
  font-size: 1rem;
  font-weight: 400;
  line-height: 1;
  margin-bottom: 20px;
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
