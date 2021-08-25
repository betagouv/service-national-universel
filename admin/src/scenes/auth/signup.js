import React from "react";
import { FormGroup, Row, Col } from "reactstrap";
import { Formik, Field } from "formik";
import validator from "validator";
import { Link, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

import { setUser } from "../../redux/auth/actions";
import PasswordEye from "../../components/PasswordEye";
import api from "../../services/api";
import LoadingButton from "../../components/buttons/LoadingButton";
import Header from "./components/header";
import LoginBox from "./components/loginBox";
import AuthWrapper from "./components/authWrapper";
import Title from "./components/title";
import Subtitle from "./components/subtitle";

import { DEFAULT_STRUCTURE_NAME, translate, colors } from "../../utils";

export default () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  if (user) return <Redirect to="/" />;

  const createStructure = async () => {
    const { data, ok, code } = await api.post(`/structure`, { name: DEFAULT_STRUCTURE_NAME, status: "DRAFT" });
    if (!ok) return toastr.error("Une erreur s'est produite lors de l'initialisation de votre structure", translate(code));
    return data._id;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Header />
      <AuthWrapper>
        <Thumb />
        <div>
          <LoginBox>
            <div>
              <Title>Inscrivez votre structure d'accueil</Title>
              <Subtitle style={{ color: colors.grey }}>A destination des structures souhaitant accueillir des volontaires</Subtitle>
              <Formik
                validateOnChange={false}
                validateOnBlur={false}
                initialValues={{ firstName: "", lastName: "", email: "", password: "" }}
                onSubmit={async (values, actions) => {
                  try {
                    const { firstName, lastName, email, password } = values;
                    const { user, token, code, ok } = await api.post(`/referent/signup`, { firstName, lastName, email, password });
                    actions.setSubmitting(false);
                    if (!ok) {
                      if (code === "PASSWORD_NOT_VALIDATED")
                        return toastr.error(
                          "Mot de passe incorrect",
                          "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole",
                          { timeOut: 10000 }
                        );
                      if (code === "USER_ALREADY_REGISTERED") return toastr.error("Votre compte est déja activé. Veuillez vous connecter", { timeOut: 10000 });
                      return toastr.error("Problème", translate(code));
                    }
                    if (token) api.setToken(token);
                    const structureId = await createStructure();
                    const newValues = { ...values, structureId, ...user };
                    const { ok: okPut, code: codePut, data: referent } = await api.put("/referent", newValues);
                    if (!okPut) return toastr.error("Une erreur s'est produite :", translate(codePut));
                    dispatch(setUser(referent));
                    history.push("/auth/signup/structure");
                  } catch (e) {
                    if (e && e.code === "USER_ALREADY_REGISTERED") return toastr.error("Le compte existe déja. Veuillez vous connecter");
                    toastr.error("Oups, une erreur est survenue", translate(e?.code), { timeOut: 3000 });
                    actions.setSubmitting(false);
                    console.log("e", e);
                  }
                }}
              >
                {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
                  return (
                    <form onSubmit={handleSubmit}>
                      <Subtitle style={{ color: "#6A7986", fontSize: "0.85rem" }}>CRÉEZ UN COMPTE RESPONSABLE DE STRUCTURE</Subtitle>
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
                        <label>Mot de passe</label>
                        <p style={{ fontSize: 12, color: colors.grey }}>👉 Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole</p>
                        <PasswordEye value={values.password} onChange={handleChange} />
                        <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.password}</p>
                      </StyledFormGroup>
                      <Submit loading={isSubmitting} type="submit" color="primary">
                        Continuer
                      </Submit>
                    </form>
                  );
                }}
              </Formik>
            </div>
            <div>
              <hr />
              <Register>
                Vous avez déjà un compte ? <Link to="/auth">Connectez-vous</Link>
              </Register>
            </div>
          </LoginBox>
        </div>
      </AuthWrapper>
    </div>
  );
};

const Register = styled.h3`
  position: relative;
  font-size: 1rem;
  text-align: center;
  color: ${colors.grey};
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  font-weight: 400;
  margin-bottom: 20px;
  a {
    color: ${colors.purple};
    font-weight: 500;
  }
`;

const Thumb = styled.div`
  min-height: 400px;
  background: url(${require("../../assets/login.jpg")}) no-repeat center;
  background-size: cover;
  flex: 1;
  @media (max-width: 768px) {
    display: none;
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
