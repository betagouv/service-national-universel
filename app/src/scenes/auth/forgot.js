import React, { useState } from "react";
import { FormGroup } from "reactstrap";
import { Formik, Field } from "formik";
import classnames from "classnames";
import validator from "validator";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import { Link } from "react-router-dom";

import LoadingButton from "../../components/loadingButton";
import api from "../../services/api";
import { translate } from "../../utils";

export default () => {
  const [done, setDone] = useState(false);
  const [mail, setMail] = useState();

  return (
    <AuthWrapper>
      <ForgotBox>
        <Logos>
          <Link to="/">
            <img src={require("../../assets/small-logo.svg")} height={22} />
          </Link>
          <Link to="/">
            <img src={require("../../assets/logo-snu.png")} height={62} />
          </Link>
        </Logos>
        {done ? (
          <>
            <Title>
              E-mail <span>envoyé</span>
            </Title>
            <Subtitle>Un email de réinitialisation de mot de passe vous a été envoyé !</Subtitle>
            <Subtitle>
              <span>{mail}</span>
            </Subtitle>
            <Description>Cet e-mail contient un lien permettant de réinitialiser ton mot de passe.</Description>
            <Link to="/auth">
              <BackButton>Retourner à la connexion</BackButton>
            </Link>
          </>
        ) : (
          <>
            <Title>
              Mon <span>Espace volontaire</span>
            </Title>
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
                          validate={(v) => !validator.isEmail(v) && "Invalid email address"}
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
      </ForgotBox>
      <ThumbBox />
    </AuthWrapper>
  );
};

const AuthWrapper = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #fff;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  color: #1a202c;
`;
const Logos = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 60px;
  img {
    vertical-align: top;
    margin-right: 20px;
  }
`;

const ForgotBox = styled.div`
  font-family: Arial, Helvetica, sans-serif;
  max-width: 600px;
  padding: 15px 40px;
`;

const ThumbBox = styled.div`
  flex: 0 0 50%;
  max-width: 50%;
  background: url(${require("../../assets/login.jpg")}) center no-repeat;
  background-size: cover;
`;

const Title = styled.h1`
  font-size: 46px;
  font-weight: 700;
  margin-bottom: 10px;
  span {
    color: #434190;
  }
`;

const Subtitle = styled.h2`
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 20px;
  span {
    color: #434190;
  }
`;

const Description = styled.p`
  font-size: 24px;
  font-weight: 400;
  line-height: 1;
  margin-bottom: 20px;
`;

const Submit = styled(LoadingButton)`
  width: 100%;
  display: block;
  font-size: 18px;
  border-radius: 0;
  padding: 15px;
  border: 1px solid #434190;
  background-color: #434190;
  margin-top: 30px;
  :hover {
    background-color: #5a67d8;
  }
  :focus {
    border: 1px solid rgba(66, 153, 225, 0.5);
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
`;

const InputField = styled(Field)`
  background-color: transparent;
  outline: 0;
  display: block;
  width: 100%;
  padding: 15px;
  margin-top: 3px;
  margin-bottom: 0;
  border: 1px solid #e2e8f0;
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
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
    & + label {
      color: #434190;
    }
    ::placeholder {
      color: #ccd5e0;
    }
  }
`;

const StyledFormGroup = styled(FormGroup)`
  margin-bottom: 20px;
  div {
    display: flex;
    flex-direction: column-reverse;
  }
`;

const BackButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 700;
  font-size: 20px;
  margin: 40px auto 0;
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;
