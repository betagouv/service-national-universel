import React, { useEffect, useState } from "react";
import { FormGroup, Row, Col, Input } from "reactstrap";
import { Formik, Field } from "formik";
import validator from "validator";
import { Link, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";

import { setUser, setStructure } from "../../redux/auth/actions";

import api from "../../services/api";
import LoadingButton from "../../components/loadingButton";
import Header from "./components/header";

import matomo from "../../services/matomo";
import { translate } from "../../utils";

export default () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);
  if (!user) return <Redirect to="/" />;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Header />
      <AuthWrapper>
        <Thumb />
        <div>
          <LoginBox>
            <Title>Bienvenue {`${user.firstName} ${user.lastName}`}</Title>
            <Subtitle>Complétez votre profil pour finaliser la création de votre compte de responsable de structure d’accueil SNU.</Subtitle>
            <Formik
              initialValues={user}
              onSubmit={async (values, actions) => {
                try {
                  const { data: user, token, code, ok } = await api.post(`/referent/signup`, values);
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
                    dispatch(setUser(user));
                    matomo.setUserId(user._id);
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
                      <label>Téléphone mobile</label>
                      <InputField
                        validate={(v) => !validator.isEmail(v) && "Veuillez renseigner votre email"}
                        name="mobile"
                        type="tel"
                        value={values.mobile}
                        onChange={handleChange}
                        placeholder="Numéro de téléphone mobile"
                        haserror={errors.mobile}
                      />
                      <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.mobile}</p>
                    </StyledFormGroup>
                    <Row noGutters>
                      <Col>
                        <StyledFormGroup>
                          <label>Téléphone fixe</label>
                          <InputField
                            validate={(v) => validator.isEmpty(v) && "Ce champ est requis"}
                            type="tel"
                            name="phone"
                            id="phone"
                            value={values.phone}
                            onChange={handleChange}
                            placeholder="Numéro de téléphone fixe"
                            haserror={errors.phone}
                          />
                          <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.phone}</p>
                        </StyledFormGroup>
                      </Col>
                    </Row>
                    <Submit loading={isSubmitting} type="submit" color="primary">
                      Terminer l'inscription
                    </Submit>
                  </form>
                );
              }}
            </Formik>
          </LoginBox>
        </div>
      </AuthWrapper>
      <StructureWrapper>TEST</StructureWrapper>
    </div>
  );
};

const StructureWrapper = styled.div`
  background-color: #f00;
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

const LoginBox = styled.div`
  padding: 4rem;
  background-color: #f6f6f6;
  @media (max-width: 768px) {
    border-radius: 0;
    margin: 0;
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
