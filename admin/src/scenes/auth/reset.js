import React, { useState } from "react";
import { Formik, Field } from "formik";
import queryString from "query-string";
import { FormGroup, Row, Col } from "reactstrap";
import { toastr } from "react-redux-toastr";
import { Redirect } from "react-router-dom";
import styled from "styled-components";

import api from "../../services/api";
import LoadingButton from "../../components/buttons/LoadingButton";
import PasswordEye from "../../components/PasswordEye";
import { translate } from "../../utils";

export default ({ location }) => {
  const [redirect, setRedirect] = useState(false);

  return (
    <Wrapper noGutters>
      <Col sm={6}>
        <AuthWrapper>
          <div style={{ marginBottom: 60 }}>
            <img src={require("../../assets/logo-snu.png")} width={100} />
          </div>
          <Title>Créer un nouveau mot de passe</Title>
          <Formik
            initialValues={{ password: "" }}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={async ({ password }, actions) => {
              try {
                const { token } = queryString.parse(location.search);
                const res = await api.post("/referent/forgot_password_reset", { password, token });
                if (!res.ok) throw res;
                toastr.success("Mot de passe créé");
                setRedirect(true);
              } catch (e) {
                return toastr.error(translate(e && e.code));
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
                      Créer
                    </Submit>
                  </div>
                </form>
              );
            }}
          </Formik>
        </AuthWrapper>
      </Col>
      <Col sm={6} style={{ background: "rgb(245, 249, 252)" }}>
        <Thumb>
          <h1>Plateforme du Service National Universel</h1>
          <img src={require("../../assets/auth.png")} />
        </Thumb>
      </Col>
    </Wrapper>
  );
};

const Wrapper = styled(Row)`
  height: 100vh;
  overflow: hidden;
  flex: 1;
`;

const AuthWrapper = styled.div`
  padding: 20px;
  max-width: 380px;
  width: 100%;
  margin: 0 auto;
  overflow-y: auto;
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

const Submit = styled(LoadingButton)`
  background-color: #3182ce;
  outline: 0;
  border: 0;
  color: #fff;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  :hover {
    background-color: #5a9bd8;
  }
  :disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Thumb = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
  h1 {
    color: rgb(49, 130, 206);
    margin-bottom: 60px;
    font-size: 24px;
  }
  img {
    max-width: 280px;
  }
`;
