import React, { useState } from "react";
import { FormGroup } from "reactstrap";
import { Formik, Field } from "formik";
import classnames from "classnames";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import { Link, Redirect } from "react-router-dom";
import queryString from "query-string";

import { getPasswordErrorMessage } from "../../utils";
import LoadingButton from "../../components/loadingButton";
import api from "../../services/api";
import { requiredMessage } from "../inscription/components/errorMessage";

export default () => {
  const [redirect, setRedirect] = useState(false);

  return (
    <AuthWrapper>
      {redirect && <Redirect to="/auth" />}
      <ForgotBox>
        <Logos>
          <Link to="/">
            <img src={require("../../assets/small-logo.svg")} height={22} />
          </Link>
          <Link to="/">
            <img src={require("../../assets/logo-snu.png")} height={62} />
          </Link>
        </Logos>

        <Title>
          Mon <span>Espace volontaire</span>
        </Title>
        <Subtitle>Récupérer mon mot de passe</Subtitle>
        <Formik
          initialValues={{ password: "", password1: "" }}
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
              if (e && e.code) {
                if (e.code === "PASSWORD_TOKEN_EXPIRED_OR_INVALID") return toastr.error("Lien invalide. Veuillez ré-éffectuer la procédure");
              }
              toastr.error("Une erreur s'est produite :", e && e.code);
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
                      validate={getPasswordErrorMessage}
                      className={classnames({ "has-error": errors.password })}
                      name="password"
                      type="password"
                      id="password"
                      value={values.password}
                      onChange={handleChange}
                    />
                    <label htmlFor="password">Nouveau mot de passe</label>
                  </div>
                  <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.password}</p>
                </StyledFormGroup>
                <StyledFormGroup>
                  <div>
                    <InputField
                      validate={(v) => (!v && requiredMessage) || (v !== values.password && "Les mots de passe renseignés ne sont pas identiques")}
                      className={classnames({ "has-error": errors.password1 })}
                      name="password1"
                      type="password"
                      id="password1"
                      value={values.password1}
                      onChange={handleChange}
                    />
                    <label htmlFor="password1">Confirmer votre nouveau mot de passe</label>
                  </div>
                  <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.password1}</p>
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
