import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { Field, Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import validator from "validator";
import { toastr } from "react-redux-toastr";
import DateInput from "../components/dateInput";
import * as Sentry from "@sentry/react";
import { appURL } from "../../../config";

import { getPasswordErrorMessage, translate } from "../../../utils";
import ErrorMessage, { requiredMessage } from "../components/errorMessage";
import { setYoung } from "../../../redux/auth/actions";
import FormRow from "../../../components/form/FormRow";
import api from "../../../services/api";
import { YOUNG_STATUS, YOUNG_PHASE } from "../../../utils";
import EyeOpen from "../../../assets/eye.svg";
import EyeClose from "../../../assets/eye-slash.svg";
import FormFooter from "../../../components/form/FormFooter";
import { STEPS } from "../utils";

export default () => {
  const [passwordText, setPasswordText] = useState(false);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const young = useSelector((state) => state.Auth.young) || {
    frenchNationality: "false",
    firstName: "",
    lastName: "",
    birthdateAt: "",
    email: "",
    newEmail: "",
    password: "",
    verifyPassword: "",
    birthCountry: "France",
    birthCity: "",
    birthCityZip: "",
    RGPD: "false",
    CGU: "false",
  };
  const history = useHistory();

  return (
    <Wrapper>
      <Heading>
        <h2>Création du profil du volontaire</h2>
        <p>Renseignez ci-dessous les coordonnées du volontaire</p>
      </Heading>
      <Formik
        initialValues={young}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          setLoading(true);
          try {
            const { firstName, lastName, email, password, birthdateAt } = values;
            const { user, token, code, ok } = await api.post(`/young/signup`, { firstName, lastName, email, password, birthdateAt });
            if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
            if (token) api.setToken(token);
            const newValues = { ...values, ...user };
            const { ok: okPut, code: codePut, data: young } = await api.put("/young", newValues);
            if (!okPut) return toastr.error("Une erreur s'est produite :", codePut);
            dispatch(setYoung(young));
            history.push("/inscription/coordonnees");
          } catch (e) {
            console.log(e);
            if (e.code === "USER_ALREADY_REGISTERED")
              return toastr.error("Un dossier a déjà été inscrit sur la plateforme avec ces informations.", "Si vous ne vous souvenez plus de votre identifiant, cliquez ici.", {
                timeOut: 30000,
                onToastrClick: () => window.open(`https://www.snu.gouv.fr/foire-aux-questions-11`, "_blank").focus(),
              });
            toastr.error("Oups, une erreur est survenue pendant le traitement du formulaire :", translate(e.code) || e.message);
            Sentry.captureException(e);
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ values, handleChange, handleSubmit, setFieldValue, isSubmitting, submitForm, errors, touched, validateField }) => {
          useEffect(() => {
            if (values.email) validateField("email");
          }, [values.email]);
          useEffect(() => {
            if (values.newEmail) validateField("newEmail");
          }, [values.newEmail]);
          useEffect(() => {
            if (values.password) validateField("password");
          }, [values.password]);
          useEffect(() => {
            if (values.verifyPassword) validateField("verifyPassword");
          }, [values.verifyPassword]);

          return (
            <>
              <FormRow>
                <Col md={4}>
                  <Label>Votre nationalité</Label>
                </Col>
                <Col>
                  <RadioLabel>
                    <Field
                      validate={(v) => (!v || v === "false") && "Vous devez être de nationalité française pour vous inscrire au SNU."}
                      value="true"
                      checked={values.frenchNationality === "true"}
                      type="checkbox"
                      name="frenchNationality"
                      onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked ? "true" : "false" } })}
                    />
                    Française
                  </RadioLabel>
                  <ErrorMessage errors={errors} touched={touched} name="frenchNationality" />
                  <TextUnderField>Seuls les citoyens français peuvent participer au Service National Universel</TextUnderField>
                </Col>
              </FormRow>
              <FormRow align="center">
                <Col md={4}>
                  <Label>Votre prénom</Label>
                </Col>
                <Col>
                  <FieldWithWidth
                    maxWidth="400px"
                    placeholder="Prénom"
                    className="form-control"
                    validate={(v) => !v && requiredMessage}
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                  />
                  <ErrorMessage errors={errors} touched={touched} name="firstName" />
                </Col>
              </FormRow>
              <FormRow align="center">
                <Col md={4}>
                  <Label>Votre nom</Label>
                </Col>
                <Col>
                  <FieldWithWidth
                    maxWidth="400px"
                    placeholder="Nom"
                    className="form-control"
                    validate={(v) => !v && requiredMessage}
                    name="lastName"
                    value={values.lastName}
                    onChange={handleChange}
                  />
                  <ErrorMessage errors={errors} touched={touched} name="lastName" />
                </Col>
              </FormRow>
              <FormRow align="center">
                <Col md={4}>
                  <Label>Date de naissance</Label>
                </Col>
                <Col>
                  <Field
                    hidden
                    validate={(v) => {
                      if (!v) return requiredMessage;
                      const from = new Date(2004, 1, 25, 0, 0, 0); // -1 because months are from 0 to 11
                      const to = new Date(2007, 6, 4, 0, 0, 0);
                      const [y, m, d] = v.substring(0, 10).split("-");
                      const check = new Date(parseInt(y), parseInt(m - 1), parseInt(d), 0, 0, 0);
                      return (check < from || check > to) && "Au moment du séjour, vous devez avoir 15 ans révolu et moins de 18 ans";
                    }}
                    name="birthdateAt"
                    value={values.birthdateAt}
                  />
                  <DateInput
                    value={values.birthdateAt}
                    onChange={(date) => {
                      handleChange({ target: { value: date, name: "birthdateAt" } });
                    }}
                  />
                  <ErrorMessage errors={errors} touched={touched} name="birthdateAt" />
                </Col>
              </FormRow>
              <FormRow>
                <Col md={4}>
                  <Label>Lieu de naissance</Label>
                </Col>
                <Col>
                  <FlexGroup>
                    <RadioLabel>
                      <Field
                        validate={(v) => !v && requiredMessage}
                        className="form-control"
                        type="radio"
                        name="birthCountry"
                        value="France"
                        checked={values.birthCountry === "France"}
                        onChange={handleChange}
                      />
                      Je suis né(e) en France
                    </RadioLabel>
                    <RadioLabel>
                      <Field
                        validate={(v) => !v && requiredMessage}
                        className="form-control"
                        type="radio"
                        name="birthCountry"
                        value=""
                        checked={values.birthCountry !== "France"}
                        onChange={handleChange}
                      />
                      Je suis né(e) à l'étranger
                    </RadioLabel>
                  </FlexGroup>
                  <FlexGroup style={{ marginTop: "15px" }}>
                    {values.birthCountry !== "France" && (
                      <div>
                        <FieldWithWidth
                          maxWidth="195px"
                          placeholder="Pays de naissance"
                          className="form-control"
                          validate={(v) => !v && requiredMessage}
                          name="birthCountry"
                          value={values.birthCountry}
                          onChange={handleChange}
                          style={{ marginRight: "10px" }}
                        />
                        <ErrorMessage errors={errors} touched={touched} name="birthCountry" />
                      </div>
                    )}
                    <div>
                      <FieldWithWidth
                        maxWidth="195px"
                        placeholder="Ville de naissance"
                        className="form-control"
                        validate={(v) => !v && requiredMessage}
                        name="birthCity"
                        value={values.birthCity}
                        onChange={handleChange}
                      />
                      <ErrorMessage errors={errors} touched={touched} name="birthCity" />
                    </div>
                    {values.birthCountry === "France" && (
                      <div>
                        <FieldWithWidth
                          maxWidth="195px"
                          placeholder="Code postal"
                          className="form-control"
                          validate={(v) => !v && requiredMessage}
                          name="birthCityZip"
                          value={values.birthCityZip}
                          onChange={handleChange}
                          style={{ marginLeft: "10px" }}
                        />
                        <ErrorMessage errors={errors} touched={touched} name="birthCityZip" />
                      </div>
                    )}
                  </FlexGroup>
                </Col>
              </FormRow>
              <FormRow align="center">
                <Col md={4}>
                  <Label>Votre e-mail</Label>
                </Col>
                <Col md={8}>
                  <FieldWithWidth
                    maxWidth="400px"
                    placeholder="xxx@exemple.com"
                    className="form-control"
                    validate={(v) => {
                      return (!v && requiredMessage) || (!validator.isEmail(v) && "Ce champs est au mauvais format");
                    }}
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                  />
                  <ErrorMessage errors={errors} touched={touched} name="email" />
                  <TextUnderField style={{ marginBottom: "15px" }}>Cette adresse vous servira d'identifiant de connexion, notez le bien.</TextUnderField>
                </Col>
                <Col md={4}>
                  <Label>Confirmez votre email</Label>
                </Col>
                <Col md={8}>
                  <FieldWithWidth
                    maxWidth="400px"
                    placeholder="xxx@exemple.com"
                    className="form-control"
                    validate={(v) => (!v && requiredMessage) || (v !== values.email && "Les emails renseignés ne sont pas identiques")}
                    type="email"
                    name="newEmail"
                    value={values.newEmail}
                    onChange={handleChange}
                  />
                  <EyeIcon src={passwordText ? EyeClose : EyeOpen} onClick={() => setPasswordText(!passwordText)} />
                </ContainerPass>
                <ErrorMessage errors={errors} touched={touched} name="verifyPassword" />
              </Col>
            </FormRow>
            <FormRow>
              <div style={{ marginLeft: "15px" }}>
                <RadioLabel>
                  <Field
                    validate={(v) => (!v || v === "false") && "Vous devez accepter les CGU pour continuer."}
                    value="true"
                    checked={values.CGU === "true"}
                    type="checkbox"
                    name="CGU"
                    onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked ? "true" : "false" } })}
                  />
                  <p style={{ marginBottom: "0" }}>
                    J'ai lu et j'accepte les{' '}
                    <a href={`${appURL}/conditions-generales-utilisation`} target="_blank">
                      Conditions générales d'utilisation{' '}
                    </a>
                    de la plateforme du Service national universel
                  </p>
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="CGU" />
                <RadioLabel style={{ marginTop: "0.5rem" }}>
                  <Field
                    validate={(v) => (!v || v === "false") && "Vous devez accepter les modalités de traitement pour continuer."}
                    value="true"
                    checked={values.RGPD === "true"}
                    type="checkbox"
                    name="RGPD"
                    onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked ? "true" : "false" } })}
                  />
                  <p style={{ marginBottom: "0" }}>
                    J'ai pris connaissance des{' '}
                    <a href="https://www.snu.gouv.fr/donnees-personnelles-et-cookies-23" target="_blank">
                      modalités de traitement de mes données personnelles
                    </a>
                  </p>
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="RGPD" />
              </div>
            </FormRow>
            <FormFooter loading={loading} secondButton="back" values={values} handleSubmit={handleSubmit} errors={errors} />
          </>
        )}
      </Formik>
    </Wrapper>
  );
};

const ContainerPass = styled.div`
  position: relative;
  input {
    padding-right: 40px !important;
  }
`;

const EyeIcon = styled.img`
  position: absolute;
  right: 15px;
  top: 50%;
  height: 18px;
  opacity: 0.7;
  transform: translateY(-50%);
  font-size: 18px;
  cursor: pointer;
`;

const Wrapper = styled.div`
  padding: 40px;
  @media (max-width: 768px) {
    padding: 22px;
  }
`;
const Heading = styled.div`
  margin-bottom: 30px;
  h2 {
    color: #161e2e;
    font-size: 1.8rem;
    font-weight: 700;
  }
  p {
    color: #161e2e;
    font-size: 1rem;
  }
  @media (max-width: 768px) {
    h2 {
      font-size: 1.4rem;
    }
  }
`;

const Label = styled.div`
  color: #374151;
  margin-bottom: 10px;
`;

const TextUnderField = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const FieldWithWidth = styled(Field)`
  max-width: ${({ maxWidth }) => maxWidth};
`;

const FlexGroup = styled.div`
  display: flex;
  align-items: flex-start;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  color: #374151;
  font-size: 14px;
  margin-bottom: 0;
  :last-child {
    margin-left: 12px;
  }
  input {
    cursor: pointer;
    margin-right: 12px;
    width: 15px;
    height: 15px;
    min-width: 15px;
    min-height: 15px;
  }
`;
