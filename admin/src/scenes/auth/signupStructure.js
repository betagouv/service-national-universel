import React, { useEffect, useState } from "react";
import { Row, Col } from "reactstrap";
import { Formik, Field } from "formik";
import { Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
import LoadingButton from "../../components/buttons/LoadingButton";
import Header from "./components/header";
import Title from "./components/title";
import Subtitle from "./components/subtitle";
import MultiSelect from "../../components/Multiselect";
import LoginBox from "./components/loginBox";
import AuthWrapper from "./components/authWrapper";

import { associationTypes, privateTypes, publicTypes, publicEtatTypes, translate } from "../../utils";
import AddressInput from "../../components/addressInput";
import ErrorMessage, { requiredMessage } from "../../components/errorMessage";

export default () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);
  const [networks, setNetworks] = useState([]);
  const history = useHistory();

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/structure/networks`);
      setNetworks(data);
    })();
  }, []);

  if (!user) return <Redirect to="/" />;
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Header />
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={{
          mobile: "",
          phone: "",
          name: "",
          status: "VALIDATED",
          legalStatus: "",
          associationTypes: "",
          structurePriveeType: "",
          structurePubliqueType: "",
          description: "",
          siret: "",
          website: "",
          facebook: "",
          twitter: "",
          instagram: "",
          networkId: "",
          departement: "",
          city: "",
          zip: "",
          address: "",
          location: "",
          department: "",
          region: "",
        }}
        onSubmit={async (values, actions) => {
          try {
            console.log(values);
            let { mobile, phone } = values;
            if (mobile || phone) {
              const { ok, data, code } = await api.put("/referent", { mobile, phone });
              if (ok) dispatch(setUser(data));
            }
            await api.put(`/structure/${user.structureId}`, { ...values });
            toastr.success("Structure créée");
            return history.push("/");
          } catch (e) {
            console.log(e);
            toastr.error("Erreur!");
          }
        }}
      >
        {({ values, errors, touched, isSubmitting, handleChange, handleSubmit }) => {
          return (
            <>
              <AuthWrapper>
                <Thumb />
                <div>
                  <LoginBox>
                    <Title>Bienvenue {`${user.firstName} ${user.lastName}`}</Title>
                    <Subtitle>Complétez votre profil pour finaliser la création de votre compte de responsable de structure d’accueil SNU.</Subtitle>
                    <form onSubmit={handleSubmit}>
                      <StyledFormGroup>
                        <label>Téléphone mobile</label>
                        <InputField name="mobile" type="tel" value={values.mobile} onChange={handleChange} placeholder="Numéro de téléphone mobile" haserror={errors.mobile} />
                        <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.mobile}</p>
                      </StyledFormGroup>
                      <Row noGutters>
                        <Col>
                          <StyledFormGroup>
                            <label>Téléphone fixe</label>
                            <InputField type="tel" name="phone" value={values.phone} onChange={handleChange} placeholder="Numéro de téléphone fixe" haserror={errors.phone} />
                            <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.phone}</p>
                          </StyledFormGroup>
                        </Col>
                      </Row>
                    </form>
                  </LoginBox>
                </div>
              </AuthWrapper>
              <StructureWrapper>
                <MainTitle>A propos de votre structure</MainTitle>
                <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
                  <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
                    <Wrapper>
                      <FormGroup2>
                        <label>
                          <span>*</span>NOM DE LA STRUCTURE
                        </label>
                        <Field validate={(v) => !v && requiredMessage} value={values.name} onChange={handleChange} name="name" placeholder="Nom de votre structure" />
                        <ErrorMessage errors={errors} touched={touched} name="name" />
                      </FormGroup2>
                      <FormGroup2>
                        <label>
                          <span>*</span>STATUT JURIDIQUE
                        </label>
                        <Field validate={(v) => !v && requiredMessage} component="select" name="legalStatus" value={values.legalStatus} onChange={handleChange}>
                          <option key="" value="" disabled>
                            Statut juridique
                          </option>
                          <option key="PUBLIC" value="PUBLIC">
                            {translate("PUBLIC")}
                          </option>
                          <option key="PRIVATE" value="PRIVATE">
                            {translate("PRIVATE")}
                          </option>
                          <option key="ASSOCIATION" value="ASSOCIATION">
                            {translate("ASSOCIATION")}
                          </option>
                          <option key="OTHER" value="OTHER">
                            {translate("OTHER")}
                          </option>
                        </Field>
                        <ErrorMessage errors={errors} touched={touched} name="legalStatus" />
                      </FormGroup2>
                      {values.legalStatus === "ASSOCIATION" && (
                        <FormGroup2>
                          <label>DISPOSEZ-VOUS D'UN AGRÉMENT ?</label>
                          <MultiSelect
                            value={values.associationTypes}
                            onChange={handleChange}
                            name="associationTypes"
                            options={associationTypes}
                            placeholder="Sélectionnez un ou plusieurs agréments"
                          />
                        </FormGroup2>
                      )}
                      {values.legalStatus === "PRIVATE" && (
                        <FormGroup2>
                          <label>
                            <span>*</span>TYPE DE STRUCTURE PRIVÉE
                          </label>
                          <Field validate={(v) => !v && requiredMessage} component="select" name="structurePriveeType" value={values.structurePriveeType} onChange={handleChange}>
                            <option key="" value="" disabled>
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
                          <ErrorMessage errors={errors} touched={touched} name="structurePriveeType" />
                        </FormGroup2>
                      )}
                      {values.legalStatus === "PUBLIC" && (
                        <div>
                          <FormGroup2>
                            <label>
                              <span>*</span>TYPE DE STRUCTURE PUBLIQUE
                            </label>
                            <Field
                              validate={(v) => !v && requiredMessage}
                              component="select"
                              name="structurePubliqueType"
                              value={values.structurePubliqueType}
                              onChange={handleChange}
                            >
                              <option key="" value="" disabled>
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
                            <ErrorMessage errors={errors} touched={touched} name="structurePubliqueType" />
                          </FormGroup2>
                          {["Service de l'Etat", "Etablissement public"].includes(values.structurePubliqueType) && (
                            <FormGroup2>
                              <label>
                                <span>*</span>TYPE DE SERVICE DE L'ETAT
                              </label>
                              <Field
                                validate={(v) => !v && requiredMessage}
                                component="select"
                                name="structurePubliqueEtatType"
                                value={values.structurePubliqueEtatType}
                                onChange={handleChange}
                              >
                                <option key="" value="" disabled>
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
                              <ErrorMessage errors={errors} touched={touched} name="structurePubliqueEtatType" />
                            </FormGroup2>
                          )}
                        </div>
                      )}
                      <FormGroup2>
                        <label>
                          <span>*</span>PRÉSENTATION SYNTHÉTIQUE DE LA STRUCTURE
                        </label>
                        <Field
                          validate={(v) => !v && requiredMessage}
                          name="description"
                          component="textarea"
                          rows={4}
                          value={values.description || ""}
                          onChange={handleChange}
                          placeholder="Décrivez en quelques mots votre structure"
                        />
                        <ErrorMessage errors={errors} touched={touched} name="description" />
                      </FormGroup2>
                      <FormGroup2>
                        <label>NUMÉRO DE SIRET (SI DISPONIBLE)</label>
                        <Field value={values.siret || ""} onChange={handleChange} name="siret" placeholder="Numéro de SIRET" />
                      </FormGroup2>
                    </Wrapper>
                  </Col>
                  <Col md={6}>
                    <Row>
                      <Wrapper>
                        <Row>
                          <Col md={6}>
                            <FormGroup2>
                              <label>SITE INTERNET</label>
                              <Field value={values.website || ""} onChange={handleChange} name="website" placeholder="Site internet" />
                            </FormGroup2>
                          </Col>
                          <Col md={6}>
                            <FormGroup2>
                              <label>FACEBOOK</label>
                              <Field value={values.facebook || ""} onChange={handleChange} name="facebook" placeholder="Facebook" />
                            </FormGroup2>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <FormGroup2>
                              <label>TWITTER</label>
                              <Field value={values.twitter || ""} onChange={handleChange} name="twitter" placeholder="Twitter" />
                            </FormGroup2>
                          </Col>
                          <Col md={6}>
                            <FormGroup2>
                              <label>INSTAGRAM</label>
                              <Field value={values.instagram || ""} onChange={handleChange} name="instagram" placeholder="Instagram" />
                            </FormGroup2>
                          </Col>
                        </Row>
                        <FormGroup2>
                          <label>RÉSEAU NATIONAL</label>
                          <p style={{ color: "#a0aec1", fontSize: 12 }}>
                            Si l’organisation est membre d'un réseau national (Les Banques alimentaires, Armée du Salut...), renseignez son nom. Vous permettez ainsi au superviseur
                            de votre réseau de visualiser les missions et bénévoles rattachés à votre organisation.
                          </p>
                          <Field component="select" name="networkId" value={values.networkId} onChange={handleChange}>
                            <option key="" value="" />
                            {networks &&
                              networks.map((network) => {
                                return (
                                  <option key={network._id} value={network._id}>
                                    {network.name}
                                  </option>
                                );
                              })}
                          </Field>
                        </FormGroup2>
                      </Wrapper>
                    </Row>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <Wrapper>
                      <Legend>Lieu de la structure</Legend>
                      <AddressInput
                        keys={{ city: "city", zip: "zip", address: "address", location: "location", department: "department", region: "region" }}
                        values={values}
                        handleChange={handleChange}
                        errors={errors}
                        touched={touched}
                      />
                      <p style={{ color: "#a0aec1", fontSize: 12 }}>Si l'adresse n'est pas reconnue, veuillez saisir le nom de la ville.</p>
                    </Wrapper>
                  </Col>
                </Row>
                <Footer>
                  <Submit loading={isSubmitting} type="submit" onClick={handleSubmit}>
                    Terminer l'inscription
                  </Submit>
                </Footer>
              </StructureWrapper>
            </>
          );
        }}
      </Formik>
    </div>
  );
};

const Legend = styled.div`
  color: rgb(38, 42, 62);
  margin-bottom: 20px;
  font-size: 20px;
`;

const Wrapper = styled.div`
  padding: 3rem;
  li {
    list-style-type: none;
  }
`;

const FormGroup2 = styled.div`
  margin-bottom: 25px;
  > label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    color: #6a6f85;
    display: block;
    margin-bottom: 10px;
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

const StructureWrapper = styled.div`
  background-color: #fff;
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Thumb = styled.div`
  min-height: 400px;
  background: url(${require("../../assets/smily.jpg")}) no-repeat center;
  background-size: cover;
  flex: 1;
  @media (max-width: 768px) {
    display: none;
  }
`;

const MainTitle = styled(Title)`
  font-size: 1.7rem;
  margin: 2rem;
`;

const StyledFormGroup = styled(FormGroup2)`
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

const Footer = styled.div`
  display: flex;
  justify-content: center;
`;
