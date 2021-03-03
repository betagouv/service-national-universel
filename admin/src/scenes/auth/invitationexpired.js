import React, { useState } from "react";
import { FormGroup, Row, Col } from "reactstrap";
import { Formik, Field } from "formik";
import validator from "validator";
import { Link, Redirect } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";

import { setUser, setStructure } from "../../redux/auth/actions";
import Header from "./components/header";

import api from "../../services/api";
import LoadingButton from "../../components/buttons/LoadingButton";
import { translate } from "../../utils";

export default () => {
  const urlParams = new URLSearchParams(window.location.search);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Header />

      <AuthWrapper>
        <Thumb />
        <div>
          <LoginBox>
            <Title>Votre lien d'invitation à expiré</Title>
            <Formik
              initialValues={{ email: urlParams.get("email") || "" }}
              onSubmit={async (values, actions) => {
                try {
                  const { ok, code } = await api.post(`/referent/signup_retry`, values);
                  if (!ok) return toastr.error("Erreur !", translate(code));
                  toastr.success("Email envoyé");
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
                      <label>ADRESSE EMAIL</label>
                      <InputField
                        validate={(v) => !validator.isEmail(v) && "Veuillez renseigner votre email"}
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        placeholder="EMAIL"
                        haserror={errors.email}
                      />
                      <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.email}</p>
                    </StyledFormGroup>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 40 }}>
                      <Submit loading={isSubmitting} type="submit" color="primary">
                        Cliquez ici pour recevoir une nouvelle invitation valide
                      </Submit>
                    </div>
                    <Account>
                      Si le problème persiste, ou si vous ne recevez pas de mail, contactez nous sur <a href="mailto:contact@snu.gouv.fr">contact@snu.gouv.fr</a>
                    </Account>
                  </form>
                );
              }}
            </Formik>
          </LoginBox>
        </div>
      </AuthWrapper>
    </div>
  );
};

const LoginBox = styled.div`
  padding: 4rem;
  background-color: #f6f6f6;
  @media (max-width: 768px) {
    border-radius: 0;
    margin: 0;
  }
`;

const Thumb = styled.div`
  min-height: 400px;
  background: url(${require("../../assets/rang.jpeg")}) no-repeat center;
  background-size: cover;
  flex: 1;
`;

const AuthWrapper = styled.div`
  display: flex;
  width: 100%;
  > * {
    flex: 1;
  }
`;

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 15px;
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
  display: block;
  width: 100%;
  margin-bottom: 0.375rem;
  background-color: #fff;
  color: #606266;
  outline: 0;
  padding: 9px 20px;
  border-radius: 4px;
  border: 1px solid;
  border-color: ${({ haserror }) => (haserror ? "red" : "#dcdfe6")};
  ::placeholder {
    color: #d6d6e1;
  }
  :focus {
    border: 1px solid #aaa;
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
  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
const Account = styled.div`
  border-top: 1px solid #cbd5e0;
  padding-top: 25px;
  margin-top: 100px;
  font-size: 14px;
  color: #6a6f88;
  a {
    color: #262a3e;
    font-weight: 600;
    margin-left: 5px;
  }
`;
