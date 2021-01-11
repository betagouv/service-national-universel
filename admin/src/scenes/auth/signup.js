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

export default () => {
  const [invitation, setInvitation] = useState("");
  const [newuser, setNewUser] = useState(null);

  useEffect(() => {
    (async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const invitationToken = urlParams.get("token");
      if (!invitationToken) return setInvitation("INVITATION_TOKEN_EXPIRED_OR_INVALID");
      const { data: u, code, token } = await api.post(`/referent/signup_verify`, { invitationToken });
      if (token) api.setToken(token);
      if (code === "INVITATION_TOKEN_EXPIRED_OR_INVALID") return setInvitation("INVITATION_TOKEN_EXPIRED_OR_INVALID");
      setNewUser(u);
    })();
  }, []);

  const dispatch = useDispatch();

  const user = useSelector((state) => state.Auth.user);

  if (invitation === "INVITATION_TOKEN_EXPIRED_OR_INVALID") return <Redirect to="/auth/invitationexpired" />;
  if (user) return <Redirect to="/" />;

  if (!newuser) return <div>Chargement...</div>;

  return (
    <Wrapper noGutters>
      <Col sm={6}>
        <AuthWrapper>
          <div style={{ marginBottom: 60 }}>
            <img src={require("../../assets/logo-snu.png")} width={100} />
          </div>
          <Title>{`Activez votre compte de Référent du département : ${newuser.department}`}</Title>
          <Formik
            initialValues={{ firstName: newuser.firstName, lastName: newuser.lastName, email: newuser.email, password: "", role: newuser.role }}
            onSubmit={async (values, actions) => {
              try {
                const { data: user, token, code, ok } = await api.post(`/referent/signup`, values);
                actions.setSubmitting(false);
                if (!ok) {
                  if (code === "PASSWORD_NOT_VALIDATED")
                    return toastr.error("Mot de passe incorrect", "Votre mot de passe doit contenir au moins 6 caractères et une lettre", { timeOut: 10000 });
                  if (code === "USER_ALREADY_REGISTERED") return toastr.error("Votre compte est déja activé. Veuillez vous connecter", { timeOut: 10000 });
                  return toastr.error("Problème", code);
                }
                if (token) api.setToken(token);
                if (user) dispatch(setUser(user));
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
                    <label>ADRESSE EMAIL</label>
                    <InputField
                      validate={(v) => !validator.isEmail(v) && "Veuillez renseigner votre email"}
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder="Email"
                      hasError={errors.email}
                    />
                    <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.email}</p>
                  </StyledFormGroup>
                  <Row noGutters>
                    <Col>
                      <StyledFormGroup>
                        <label htmlFor="firstName">Prénom</label>
                        <InputField
                          validate={(v) => validator.isEmpty(v) && "Ce champ est requis"}
                          name="firstName"
                          type="name"
                          id="firstName"
                          value={values.firstName}
                          onChange={handleChange}
                          placeholder="Prénom"
                          hasError={errors.firstName}
                        />
                        <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.firstName}</p>
                      </StyledFormGroup>
                    </Col>
                    <div style={{ width: 10 }} />
                    <Col>
                      <StyledFormGroup>
                        <label htmlFor="lastName">Nom</label>
                        <InputField
                          validate={(v) => validator.isEmpty(v) && "Ce champ est requis"}
                          name="lastName"
                          type="lastName"
                          id="lastName"
                          value={values.lastName}
                          onChange={handleChange}
                          placeholder="Nom"
                          hasError={errors.lastName}
                        />
                        <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.lastName}</p>
                      </StyledFormGroup>
                    </Col>
                  </Row>
                  <StyledFormGroup>
                    <label htmlFor="password">Mot de passe</label>
                    <InputField
                      validate={(v) => validator.isEmpty(v) && "Ce champ est requis"}
                      name="password"
                      type="password"
                      id="repassword"
                      value={values.password}
                      onChange={handleChange}
                      placeholder="Choisissez votre mot de passe"
                      hasError={errors.password}
                    />
                    <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.password}</p>
                  </StyledFormGroup>
                  <Submit loading={isSubmitting} type="submit" color="primary">
                    Activer mon compte
                  </Submit>
                  <Account>
                    Vous avez déjà un compte ? <Link to="/auth/signin">Connectez-vous</Link>
                  </Account>
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
  border-color: ${({ hasError }) => (hasError ? "red" : "#dcdfe6")};
  ::placeholder {
    color: #d6d6e1;
  }
  :focus {
    border: 1px solid #aaa;
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
  margin-top: 40px;
  :hover {
    background-color: #5a9bd8;
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
