/* eslint-disable react/jsx-no-duplicate-props */
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col } from "reactstrap";
import { Field, Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import DateInput from "../../components/dateInput";
import * as Sentry from "@sentry/react";
import validator from "validator";

import { translate } from "../../../../utils";
import ErrorMessage, { requiredMessage } from "../../components/errorMessage";
import { setYoung } from "../../../../redux/auth/actions";
import FormRow from "../../../../components/form/FormRow";
import api from "../../../../services/api";
import FormFooter from "../../../../components/form/FormFooter";

export default function StepProfilOnline() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [data, setData] = useState();
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  const isYoungFromEduConnect = young?.INEHash;

  useEffect(() => {
    if (young !== undefined) {
      setData({
        firstName: young.firstName,
        lastName: young.lastName,
        birthdateAt: young.birthdateAt,
        birthCountry: young.birthCountry,
        birthCity: young.birthCity,
        birthCityZip: young.birthCityZip,
        email: young.email,
      });

      if (young.birthCityZip && young.birthCountrySelector === undefined) {
        setData((data) => ({ ...data, birthCountrySelector: "true" }));
      } else {
        setData((data) => ({ ...data, birthCountrySelector: "false" }));
      }
    }
  }, [young]);

  if (!data) return null;

  return (
    <Wrapper>
      <Heading>
        <h2>Création du profil du volontaire</h2>
        <p>Renseignez ci-dessous les coordonnées du volontaire</p>
      </Heading>
      <Formik
        initialValues={data}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          setLoading(true);
          try {
            const { email, firstName, lastName, birthdateAt, birthCountry, birthCity, birthCityZip } = values;
            const {
              ok: okPut,
              code: codePut,
              data: user,
            } = await api.put("/young/inscription/profile", { email, firstName, lastName, birthdateAt, birthCountry, birthCity, birthCityZip });
            if (!okPut || !user?._id) return toastr.error("Une erreur s'est produite :", translate(codePut));
            dispatch(setYoung(user));
            history.push("/inscription/coordonnees");
          } catch (e) {
            toastr.error("Oups, une erreur est survenue pendant le traitement du formulaire :", translate(e.code) || e.message);
            Sentry.captureException(e);
          } finally {
            setLoading(false);
          }
        }}>
        {({ values, handleChange, handleSubmit, errors, touched }) => {
          useEffect(() => {
            (async () => {
              if (values.birthCityZip?.length === 5) {
                const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${values.birthCityZip}`, {
                  mode: "cors",
                  method: "GET",
                  headers: { "Content-Type": "application/json" },
                });
                const res = await response.json();
                setSuggestions(res.map((item) => item.nom));
              }
            })();
          }, [values.birthCityZip]);

          return (
            <>
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
                    disabled={isYoungFromEduConnect}
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
                    disabled={isYoungFromEduConnect}
                  />
                  <ErrorMessage errors={errors} touched={touched} name="lastName" />
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
                  <TextUnderField style={{ marginBottom: "15px" }}>Cette adresse vous servira d&apos;identifiant de connexion, notez le bien.</TextUnderField>
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
                    name="verifyEmail"
                    value={values.verifyEmail}
                    onChange={handleChange}
                  />
                  <ErrorMessage errors={errors} touched={touched} name="verifyEmail" />
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
                      const from = new Date(2004, 1, 26, 0, 0, 0); // -1 because months are from 0 to 11
                      const to = new Date(2007, 6, 2, 0, 0, 0);
                      const [y, m, d] = v.substring(0, 10).split("-");
                      const check = new Date(parseInt(y), parseInt(m - 1), parseInt(d), 0, 0, 0);
                      return (check < from || check > to) && "Au moment du séjour, vous devez avoir 15 ans révolu et moins de 18 ans";
                    }}
                    name="birthdateAt"
                    value={values.birthdateAt}
                  />
                  <DateInput
                    disabled={isYoungFromEduConnect}
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
                  <FlexGroup style={{ flexWrap: "wrap" }}>
                    <RadioLabel>
                      <Field
                        validate={(v) => !v && requiredMessage}
                        className="form-control"
                        type="radio"
                        name="birthCountrySelector"
                        value="true"
                        checked={values.birthCountrySelector === "true"}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleChange({ target: { value, name: "birthCountrySelector" } });
                          handleChange({ target: { value: "France", name: "birthCountry" } });
                          handleChange({ target: { value: "", name: "birthCity" } });
                          handleChange({ target: { value: "", name: "birthCityZip" } });
                        }}
                      />
                      Je suis né(e) en France
                    </RadioLabel>
                    <RadioLabel>
                      <Field
                        validate={(v) => !v && requiredMessage}
                        className="form-control"
                        type="radio"
                        name="birthCountrySelector"
                        value="false"
                        checked={values.birthCountrySelector === "false"}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleChange({ target: { value, name: "birthCountrySelector" } });
                          handleChange({ target: { value: "", name: "birthCountry" } });
                          handleChange({ target: { value: "", name: "birthCity" } });
                          handleChange({ target: { value: "", name: "birthCityZip" } });
                        }}
                      />
                      Je suis né(e) à l&apos;étranger
                    </RadioLabel>
                  </FlexGroup>
                  <FlexGroup style={{ marginTop: "15px" }}>
                    {values.birthCountry !== "France" && values.birthCountrySelector === "false" && (
                      <>
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
                      </>
                    )}
                    {values.birthCountrySelector === "true" && (
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        <div>
                          <FieldWithWidth
                            maxWidth="195px"
                            placeholder="Code postal"
                            className="form-control"
                            validate={(v) => !v && requiredMessage}
                            name="birthCityZip"
                            value={values.birthCityZip}
                            onChange={handleChange}
                            style={{ marginRight: "10px" }}
                          />
                          <ErrorMessage errors={errors} touched={touched} name="birthCityZip" />
                        </div>
                        <div>
                          <Field
                            as="select"
                            validate={(v) => !v && requiredMessage}
                            disabled={values.birthCityZip?.length !== 5}
                            className="form-control"
                            name="birthCity"
                            value={values.birthCity}
                            onChange={handleChange}>
                            <option selected={values.birthCity === undefined || values.birthCity === ""}>Ville de naissance</option>
                            {suggestions.map((el) => (
                              <option key={el} value={el} label={el}>
                                {el}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage errors={errors} touched={touched} name="birthCity" />
                        </div>
                      </div>
                    )}
                  </FlexGroup>
                </Col>
              </FormRow>
              <FormFooter loading={loading} secondButton="back" values={values} handleSubmit={handleSubmit} errors={errors} />
            </>
          );
        }}
      </Formik>
    </Wrapper>
  );
}

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
  margin-bottom: 0.5rem;
  margin-right: 0.5rem;
  input {
    cursor: pointer;
    margin-right: 12px;
    width: 15px;
    height: 15px;
    min-width: 15px;
    min-height: 15px;
  }
`;

const TextUnderField = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;
