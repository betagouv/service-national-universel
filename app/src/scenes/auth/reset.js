import React, { useState } from "react";
import { FormGroup } from "reactstrap";
import { Formik, Field } from "formik";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { Link, Redirect } from "react-router-dom";
import PasswordEye from "../../components/PasswordEye";
import queryString from "query-string";

import api from "../../services/api";
import LoadingButton from "../../components/loadingButton";
import Header from "./components/header";
import { translate } from "../../utils";

export default () => {
  const [redirect, setRedirect] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {redirect && <Redirect to="/auth" />}
      <Header />
      <AuthWrapper>
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
