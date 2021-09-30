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
import Title from "./components/title";
import Subtitle from "./components/subtitle";
import ErrorMessage, { requiredMessage } from "../../components/errorMessage";
import MultiSelect from "../../components/Multiselect";

import { associationTypes, privateTypes, publicTypes, publicEtatTypes, translate, colors, getRegionByZip, getDepartmentByZip } from "../../utils";

export default () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const user = useSelector((state) => state.Auth.user);
  if (user) return <Redirect to="/" />;

  const createStructure = async (structureData) => {
    const region = getRegionByZip(structureData.zip);
    const department = getDepartmentByZip(structureData.zip);
    const { data, ok, code } = await api.post(`/structure`, { ...structureData, region, department });
    if (!ok) return toastr.error("Une erreur s'est produite lors de l'initialisation de votre structure", translate(code));
    return data._id;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Header />
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={{ user: {}, structure: {} }}
        onSubmit={async (values, actions) => {
          try {
            const { firstName, lastName, email, password } = values?.user;
            const { user, token, code, ok } = await api.post(`/referent/signup`, { firstName, lastName, email, password });
            if (!ok) {
              if (code === "PASSWORD_NOT_VALIDATED")
                return toastr.error(
                  "Mot de passe incorrect",
                  "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole",
                  { timeOut: 10000 }
                );
              if (code === "USER_ALREADY_REGISTERED") return toastr.error("Votre compte est déja activé. Veuillez vous connecter", { timeOut: 10000 });
              return toastr.error("Un problème est survenu lors de la création de votre compte.", translate(code));
            }
            dispatch(setUser(user));
            if (token) api.setToken(token);
            const structureId = await createStructure(values?.structure);
            const responseResponsableUpdated = await api.put("/referent", { structureId });
            if (!responseResponsableUpdated.ok)
              return toastr.error("Une erreur s'est produite lors de l'affiliation de la structure :", translate(responseResponsableUpdated.code));
            dispatch(setUser(responseResponsableUpdated.data));
            history.push("/");
          } catch (e) {
            if (e && e.code === "USER_ALREADY_REGISTERED") return toastr.error("Le compte existe déja. Veuillez vous connecter");
            toastr.error("Oups, une erreur est survenue", translate(e?.code), { timeOut: 3000 });
            actions.setSubmitting(false);
            console.log("e", e);
          }
        }}
      >
        {({ values, errors, touched, isSubmitting, handleChange, handleSubmit }) => {
          return (
            <AuthWrapper>
              <Title>Inscrivez votre structure d'accueil</Title>
              <Subtitle style={{ color: colors.grey }}>A destination des structures souhaitant accueillir des volontaires</Subtitle>
              <div>
                <hr />
                <Register>
                  Vous avez déjà un compte ? <Link to="/auth">Connectez-vous</Link>
                </Register>
              </div>
              <LoginBoxes>
                <LoginBox>
                  <form onSubmit={handleSubmit}>
                    <Subtitle style={{ color: "#6A7986", fontSize: "0.85rem" }}>INFORMATIONS SUR LE RESPONSABLE DE STRUCTURE</Subtitle>
                    <StyledFormGroup>
                      <label>
                        <span>*</span>ADRESSE EMAIL
                      </label>
                      <InputField
                        validate={(v) => (!v && "Ce champ est requis") || (!validator.isEmail(v) && "Veuillez renseigner votre email")}
                        name="user.email"
                        type="email"
                        value={values.user.email}
                        onChange={handleChange}
                        placeholder="Email"
                        haserror={errors.user?.email}
                      />
                      <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.user?.email}</p>
                    </StyledFormGroup>
                    <Row noGutters>
                      <Col>
                        <StyledFormGroup>
                          <label htmlFor="firstName">
                            <span>*</span>Prénom
                          </label>
                          <InputField
                            validate={(v) => !v && "Ce champ est requis"}
                            name="user.firstName"
                            id="firstName"
                            value={values.user.firstName}
                            onChange={handleChange}
                            placeholder="Prénom"
                            haserror={errors.user?.firstName}
                          />
                          <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.user?.firstName}</p>
                        </StyledFormGroup>
                      </Col>
                      <div style={{ width: 10 }} />
                      <Col>
                        <StyledFormGroup>
                          <label htmlFor="lastName">
                            <span>*</span>Nom
                          </label>
                          <InputField
                            validate={(v) => !v && "Ce champ est requis"}
                            name="user.lastName"
                            id="lastName"
                            value={values.user.lastName}
                            onChange={handleChange}
                            placeholder="Nom"
                            haserror={errors.user?.lastName}
                          />
                          <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.user?.lastName}</p>
                        </StyledFormGroup>
                      </Col>
                    </Row>
                    <Row noGutters>
                      <Col>
                        <StyledFormGroup>
                          <label htmlFor="phone">Téléphone</label>
                          <InputField name="user.phone" type="tel" id="phone" value={values.user.phone} onChange={handleChange} placeholder="02 00 00 00 00" />
                        </StyledFormGroup>
                      </Col>
                      <div style={{ width: 10 }} />
                      <Col>
                        <StyledFormGroup>
                          <label htmlFor="mobile">Téléphone portable</label>
                          <InputField name="user.mobile" type="tel" id="mobile" value={values.user.mobile} onChange={handleChange} placeholder="06 00 00 00 00" />
                        </StyledFormGroup>
                      </Col>
                    </Row>
                    <StyledFormGroup>
                      <label>
                        <span>*</span>Mot de passe
                      </label>
                      <p style={{ fontSize: 12, color: colors.grey }}>👉 Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole</p>
                      <PasswordEye autoComplete="new-password" value={values.user.password} onChange={handleChange} name="user.password" />
                      <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.user?.password}</p>
                    </StyledFormGroup>
                    <StyledFormGroup>
                      <label>
                        <span>*</span>Confirmation mot de passe
                      </label>
                      <PasswordEye
                        validate={() => values.user.password !== values.user.repassword && "Les mots de passe ne correspondent pas."}
                        autoComplete="new-password"
                        value={values.user.repassword}
                        onChange={handleChange}
                        name="user.repassword"
                        placeholder="Confirmez votre mot de passe"
                      />
                      <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.user?.repassword}</p>
                    </StyledFormGroup>
                  </form>
                </LoginBox>
                <LoginBox>
                  <form onSubmit={handleSubmit}>
                    <Subtitle style={{ color: "#6A7986", fontSize: "0.85rem" }}>INFORMATIONS SUR LA STRUCTURE</Subtitle>
                    <StyledFormGroup>
                      <label>
                        <span>*</span>NOM DE LA STRUCTURE
                      </label>
                      <InputField
                        validate={(v) => !v && requiredMessage}
                        value={values.structure.name}
                        onChange={handleChange}
                        name="structure.name"
                        placeholder="Nom de votre structure"
                      />
                      <ErrorMessage errors={errors} touched={touched} name="structure.name" />
                    </StyledFormGroup>
                    <StyledFormGroup>
                      <label>
                        <span>*</span>STATUT JURIDIQUE
                      </label>
                      <Field validate={(v) => !v && requiredMessage} component="select" name="structure.legalStatus" value={values.structure.legalStatus} onChange={handleChange}>
                        <option value={null} disabled selected>
                          Statut juridique
                        </option>
                        <option value="PUBLIC">{translate("PUBLIC")}</option>
                        <option value="PRIVATE">{translate("PRIVATE")}</option>
                        <option value="ASSOCIATION">{translate("ASSOCIATION")}</option>
                        <option value="OTHER">{translate("OTHER")}</option>
                      </Field>
                      <ErrorMessage errors={errors} touched={touched} name="structure.legalStatus" />
                    </StyledFormGroup>
                    {values.structure.legalStatus === "ASSOCIATION" && (
                      <StyledFormGroup>
                        <label>DISPOSEZ-VOUS D'UN AGRÉMENT ?</label>
                        <MultiSelect
                          value={values.structure.associationTypes}
                          onChange={handleChange}
                          name="structure.associationTypes"
                          options={associationTypes}
                          placeholder="Sélectionnez un ou plusieurs agréments"
                        />
                      </StyledFormGroup>
                    )}
                    {values.structure.legalStatus === "PRIVATE" && (
                      <StyledFormGroup>
                        <label>
                          <span>*</span>TYPE DE STRUCTURE PRIVÉE
                        </label>
                        <Field
                          validate={(v) => !v && requiredMessage}
                          component="select"
                          name="structure.structurePriveeType"
                          value={values.structure.structurePriveeType}
                          onChange={handleChange}
                        >
                          <option key="" value="" selected disabled>
                            Type de structure privée
                          </option>
                          {privateTypes.map((e) => {
                            return (
                              <option key={e} value={e}>
                                {translate(e)}
                              </option>
                            );
                          })}
                        </Field>
                        <ErrorMessage errors={errors} touched={touched} name="structure.structurePriveeType" />
                      </StyledFormGroup>
                    )}
                    {values.structure.legalStatus === "PUBLIC" && (
                      <div>
                        <StyledFormGroup>
                          <label>
                            <span>*</span>TYPE DE STRUCTURE PUBLIQUE
                          </label>
                          <Field
                            validate={(v) => !v && requiredMessage}
                            component="select"
                            name="structure.structurePubliqueType"
                            value={values.structure.structurePubliqueType}
                            onChange={handleChange}
                          >
                            <option key="" value="" selected disabled>
                              Type de structure publique
                            </option>
                            {publicTypes.map((e) => {
                              return (
                                <option key={e} value={e}>
                                  {translate(e)}
                                </option>
                              );
                            })}
                          </Field>
                          <ErrorMessage errors={errors} touched={touched} name="structure.structurePubliqueType" />
                        </StyledFormGroup>
                        {["Service de l'Etat", "Etablissement public"].includes(values.structure.structurePubliqueType) && (
                          <StyledFormGroup>
                            <label>
                              <span>*</span>TYPE DE SERVICE DE L'ETAT
                            </label>
                            <Field
                              validate={(v) => !v && requiredMessage}
                              component="select"
                              name="structure.structurePubliqueEtatType"
                              value={values.structure.structurePubliqueEtatType}
                              onChange={handleChange}
                            >
                              <option key="" value="" selected disabled>
                                Type de service de l'état
                              </option>
                              {publicEtatTypes.map((e) => {
                                return (
                                  <option key={e} value={e}>
                                    {translate(e)}
                                  </option>
                                );
                              })}
                            </Field>
                            <ErrorMessage errors={errors} touched={touched} name="structure.structurePubliqueEtatType" />
                          </StyledFormGroup>
                        )}
                      </div>
                    )}
                    <StyledFormGroup>
                      <label>
                        <span>*</span>Code postal de la structure
                      </label>
                      <InputField validate={(v) => !v && requiredMessage} value={values.structure.zip} onChange={handleChange} name="structure.zip" placeholder="44000" />
                      <ErrorMessage errors={errors} touched={touched} name="structure.zip" />
                    </StyledFormGroup>
                  </form>
                </LoginBox>
              </LoginBoxes>
              <Submit loading={isSubmitting} type="submit" color="primary" onClick={handleSubmit}>
                Continuer
              </Submit>
            </AuthWrapper>
          );
        }}
      </Formik>
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
  flex: 1 2;
  min-height: 400px;
  background: url(${require("../../assets/login.jpg")}) no-repeat center;
  background-size: cover;
  @media (max-width: 1000px) {
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
    > span {
      color: red;
      font-size: 10px;
      margin-right: 5px;
    }
  }
  select,
  textarea,
  input {
    display: block;
    width: 100%;
    background-color: #fff;
    color: #606266;
    border: 0;
    outline: 0;
    padding: 11px 20px;
    border-radius: 6px;
    margin-right: 15px;
    border: 1px solid #dcdfe6;
    ::placeholder {
      color: #d6d6e1;
    }
    :focus {
      border: 1px solid #aaa;
    }
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
  margin-bottom: 1rem;
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

const LoginBoxes = styled.div`
  display: flex;
`;
const AuthWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
