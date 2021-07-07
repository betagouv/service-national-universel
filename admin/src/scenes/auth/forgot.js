import React, { useState } from "react";
import { FormGroup } from "reactstrap";
import { Formik, Field } from "formik";
import validator from "validator";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";

import LoadingButton from "../../components/buttons/LoadingButton";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { translate } from "../../utils";
import Header from "./components/header";
import LoginBox from "./components/loginBox";
import AuthWrapper from "./components/authWrapper";
import Title from "./components/title";
import Subtitle from "./components/subtitle";

export default () => {
  const [mail, setMail] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Header />
      <AuthWrapper>
        <Thumb />
        <div>
          <LoginBox>
            <div>
              <Formik
                initialValues={{ email: "" }}
                onSubmit={async ({ email }, actions) => {
                  try {
                    await api.post("/referent/forgot_password", { email });
                    setMail(email);
                  } catch (e) {
                    toastr.error("Erreur !", translate(e.code));
                  }
                  actions.setSubmitting(false);
                }}
              >
                {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
                  return (
                    <form onSubmit={handleSubmit}>
                      {mail ? (
                        <>
                          <Title>Email envoyé à : {mail}</Title>
                          <Subtitle>
                            Si vous possedez un compte chez nous, un email contenant les instructions pour réinitialiser votre mot de passe vient de vous être envoyé.
                          </Subtitle>
                          <Subtitle>
                            Si vous ne vous souvenez plus de votre email de connexion, écrivez-nous à <a href="mailto:contact@snu.gouv.fr">contact@snu.gouv.fr</a>.
                          </Subtitle>
                        </>
                      ) : (
                        <>
                          <Title>Réinitialisation du mot de passe</Title>
                          <Subtitle>Pour réinitialiser votre mot de passe, entrez l'adresse mail que vous avez utilisée pour vous connecter à la plateforme</Subtitle>
                          <StyledFormGroup>
                            <div>
                              <label>ADRESSE EMAIL</label>
                              <InputField
                                validate={(v) => !validator.isEmail(v) && "Veuillez renseigner votre email"}
                                name="email"
                                type="email"
                                value={values.email}
                                placeholder="Email"
                                onChange={handleChange}
                                hasError={errors.email}
                              />
                            </div>
                            <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.email}</p>
                          </StyledFormGroup>
                          <Submit type="submit" color="success" loading={isSubmitting}>
                            Obtenir le lien de réinitialisation par email
                          </Submit>
                        </>
                      )}
                    </form>
                  );
                }}
              </Formik>
            </div>
            <div>
              <hr />
              <Register>
                Vous avez déjà un compte ? <Link to="/auth">Connectez vous</Link>
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
