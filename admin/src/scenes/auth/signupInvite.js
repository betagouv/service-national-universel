import React, { useEffect, useState } from "react";
import { FormGroup, Row, Col } from "reactstrap";
import { Formik, Field } from "formik";
import validator from "validator";
import { Link, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";

import { setUser } from "../../redux/auth/actions";

import api from "../../services/api";
import LoadingButton from "../../components/buttons/LoadingButton";
import PasswordEye from "../../components/PasswordEye";
import Header from "./components/header";

import { translate, ROLES, colors } from "../../utils";
import Loader from "../../components/Loader";
import LoginBox from "./components/loginBox";
import AuthWrapper from "./components/authWrapper";

export default () => {
  const [invitation, setInvitation] = useState("");
  const [newuser, setNewUser] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const invitationToken = urlParams.get("token");

  useEffect(() => {
    (async () => {
      try {
        if (!invitationToken) return setInvitation("INVITATION_TOKEN_EXPIRED_OR_INVALID");
        const { data, code, token } = await api.post(`/referent/signup_verify`, { invitationToken });
        if (token) api.setToken(token);
        setNewUser(data);
      } catch (error) {
        if (error?.code === "INVITATION_TOKEN_EXPIRED_OR_INVALID") return setInvitation("INVITATION_TOKEN_EXPIRED_OR_INVALID");
      }
    })();
  }, []);

  const dispatch = useDispatch();

  const user = useSelector((state) => state.Auth.user);

  if (invitation === "INVITATION_TOKEN_EXPIRED_OR_INVALID") return <Redirect to="/auth/invitationexpired" />;
  if (user) return <Redirect to="/" />;

  if (!newuser) return <Loader />;

  let title;
  if (newuser.department && newuser.role === ROLES.REFERENT_DEPARTMENT) {
    title = `Activez votre compte de Référent du département : ${newuser.department}`;
  } else {
    title = "Activez votre compte";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Header />
      <AuthWrapper>
        <Thumb />
        <LoginBox>
          <Title>{title}</Title>
          <Formik
            initialValues={{ firstName: newuser.firstName, lastName: newuser.lastName, email: newuser.email, password: "", repassword: "", acceptCGU }}
            onSubmit={async (values, actions) => {
              try {
                const { data: user, token, code, ok } = await api.post(`/referent/signup_invite`, { ...values, invitationToken });
                actions.setSubmitting(false);
                if (ok && token) api.setToken(token);
                if (ok && user) dispatch(setUser(user));
              } catch (e) {
                actions.setSubmitting(false);
                console.log("e", e);
                if (e.code === "PASSWORD_NOT_VALIDATED")
                  return toastr.error(
                    "Mot de passe incorrect",
                    "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole",
                    { timeOut: 10000 }
                  );
                if (e.code === "USER_ALREADY_REGISTERED") return toastr.error("Votre compte est déja activé. Veuillez vous connecter", { timeOut: 10000 });
                return toastr.error("Problème", translate(e.code));
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
                      haserror={errors.email}
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
                          haserror={errors.firstName}
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
                          haserror={errors.lastName}
                        />
                        <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.lastName}</p>
                      </StyledFormGroup>
                    </Col>
                  </Row>
                  <StyledFormGroup>
                    <label htmlFor="password">
                      <span>*</span>Mot de passe
                    </label>
                    <p style={{ fontSize: 12, color: colors.grey }}>👉 Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole</p>
                    <PasswordEye autoComplete="new-password" value={values.password} onChange={handleChange} name="password" id="password" />
                    <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.password}</p>
                  </StyledFormGroup>
                  <StyledFormGroup>
                    <label htmlFor="repassword">
                      <span>*</span>Confirmation mot de passe
                    </label>
                    <PasswordEye
                      validate={() => values.password !== values.repassword && "Les mots de passe ne correspondent pas."}
                      autoComplete="new-password"
                      value={values.repassword}
                      onChange={handleChange}
                      name="repassword"
                      id="repassword"
                      placeholder="Confirmez votre mot de passe"
                    />
                    <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.repassword}</p>
                  </StyledFormGroup>
                  <StyledFormGroup style={{ display: "flex" }}>
                    <label>
                      <span>*</span>Veuillez acceptez les conditions générales d'utilisation
                    </label>
                    <InputField validate={(v) => !v && requiredMessage} type="checkbox" value={true} onChange={handleChange} name="acceptCGU" checked={values.acceptCGU} style={{ flex: "2" }} />
                    <ErrorMessage errors={errors} touched={touched} name="acceptCGU" />
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
        </LoginBox>
      </AuthWrapper>
    </div>
  );
};

const Thumb = styled.div`
  min-height: 400px;
  background: url(${require("../../assets/rang.jpg")}) no-repeat center;
  background-size: cover;
  flex: 1;
  @media (max-width: 768px) {
    display: none;
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
  background-color: ${colors.purple};
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
