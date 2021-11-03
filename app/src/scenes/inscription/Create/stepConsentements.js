import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Col } from "reactstrap";
import { Field, Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import { setYoung } from "../../../redux/auth/actions";
import DndFileInput from "../../../components/dndFileInput";
import ErrorMessage, { requiredMessage } from "../components/errorMessage";
import { STEPS } from "../utils";
import FormRow from "../../../components/form/FormRow";
import FormFooter from "../../../components/form/FormFooter";
import api from "../../../services/api";
import { translate } from "../../../utils";

export default () => {
  const [age, setAge] = useState(null);
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);
  const isPlural = useSelector((state) => state.Auth.young?.parent1Status && state.Auth.young?.parent2Status);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }

  useEffect(async () => {
    console.log("YOUNG", young);
    const year = new Date(young.birthdateAt);
    setAge(2021 - year);
    console.log("YOUNG birthdate", year.getFullYear());
  }, [])

  return (
    <Wrapper>
      <Heading>
        <h2>Consentements</h2>
        <p>Complétez ci-dessous les consentements</p>
      </Heading>
      <Formik
        initialValues={{
          ...young,
          parentConsentment1: young.parentConsentment,
          parentConsentment2: young.parentConsentment,
          parentConsentment3: young.parentConsentment,
          parentConsentment4: young.parentConsentment,
          parentConsentment5: young.parentConsentment,
          consentment1: young.consentment,
          consentment2: young.consentment,
        }}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          setLoading(true);
          try {
            values.parentConsentment = "true";
            values.consentment = "true";
            values.inscriptionStep = STEPS.DOCUMENTS;
            const { ok, code, data: young } = await api.put("/young", values);
            if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
            dispatch(setYoung(young));
            history.push("/inscription/documents");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant le traitement du formulaire :", translate(e.code));
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting, submitForm, errors, touched }) => (
          <>
            <FormRow>
              <Col md={4}>
                <Label>Consentement du ou des représentant légaux</Label>
              </Col>

              <Col>
                <SubTitle style={{ marginTop: 0 }}>
                  {isPlural ? (
                    <>
                      <span style={{ fontWeight: "normal" }}>Nous,</span>{" "}
                      {`${young.parent1FirstName} ${young.parent1LastName} et ${young.parent2FirstName} ${young.parent2LastName}`}
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: "normal" }}>Je,</span> {`${young.parent1FirstName} ${young.parent1LastName}`}
                    </>
                  )}
                </SubTitle>
                <RadioLabel style={{ marginBottom: 3 }}>
                  <Field
                    validate={(v) => !v && requiredMessage}
                    value="true"
                    checked={values.parentConsentment1}
                    type="checkbox"
                    name="parentConsentment1"
                    onChange={handleChange}
                  />
                  <div>
                    {isPlural
                      ? "confirmons être titulaires de l'autorité parentale/ les représentants légaux de"
                      : "confirme être titulaire de l'autorité parentale/ le représentant légal de"}
                    <strong>{` ${young.firstName} ${young.lastName}`}</strong>
                  </div>
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="parentConsentment1" />
                <RadioLabel style={{ marginBottom: 3 }}>
                  <Field
                    validate={(v) => !v && requiredMessage}
                    value="true"
                    checked={values.parentConsentment2}
                    type="checkbox"
                    name="parentConsentment2"
                    onChange={handleChange}
                  />
                  <div>
                    {isPlural ? "autorisons" : "autorise"}
                    <strong>{` ${young.firstName} ${young.lastName}`}</strong> à participer à la session 2022 du Service National Universel qui comprend la participation au séjour
                    de cohésion puis la réalisation d'une mission d'intérêt général
                  </div>
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="parentConsentment2" />
                {age < 15 && (
                  <>
                    <RadioLabel style={{ marginBottom: 3 }}>
                      <Field
                        validate={(v) => !v && requiredMessage}
                        value="true"
                        checked={values.parentConsentment6}
                        type="checkbox"
                        name="parentConsentment6"
                        onChange={handleChange}
                      />
                      <div>
                        <div>
                          {isPlural ? "acceptons " : "accepte "}
                          la collecte et le traitement des données personnelles de <strong>{` ${young.firstName} ${young.lastName}`}</strong> par l'administration dans le cadre de
                          l'inscription au SNU.
                        </div>
                        <a href="https://www.cnil.fr/fr/recommandation-4-rechercher-le-consentement-dun-parent-pour-les-mineurs-de-moins-de-15-ans" target="_blank">
                          En savoir plus {">"}
                        </a>
                      </div>
                    </RadioLabel>
                    <ErrorMessage errors={errors} touched={touched} name="parentConsentment6" />
                  </>
                )}
                <SubTitle>Pour la participation au séjour de cohésion</SubTitle>
                <RadioLabel style={{ marginBottom: 3 }}>
                  <Field
                    validate={(v) => !v && requiredMessage}
                    value="true"
                    checked={values.parentConsentment3}
                    type="checkbox"
                    name="parentConsentment3"
                    onChange={handleChange}
                  />
                  <div>
                    {isPlural ? "Nous nous engageons" : "Je m’engage"} à renseigner le consentement relatif aux droits à l'image* et à l'utilisation d'autotest COVID*{" "}
                    <b>avant le début du séjour de cohésion.</b>
                  </div>
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="parentConsentment3" />
                <RadioLabel>
                  <Field
                    validate={(v) => !v && requiredMessage}
                    value="true"
                    checked={values.parentConsentment4}
                    type="checkbox"
                    name="parentConsentment4"
                    onChange={handleChange}
                  />
                  <div>
                    {isPlural ? "Nous nous engageons" : "Je m’engage"} à renseigner l'utilisation d'autotest COVID*
                    <b> avant le début du séjour de cohésion.</b>
                  </div>
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="parentConsentment4" />
                <RadioLabel>
                  <Field
                    validate={(v) => !v && requiredMessage}
                    value="true"
                    checked={values.parentConsentment5}
                    type="checkbox"
                    name="parentConsentment5"
                    onChange={handleChange}
                  />
                  <div>
                    {isPlural ? "Nous nous engageons" : "Je m’engage"} à remettre la fiche sanitaire* ainsi que les documents médicaux et justificatifs nécessaires
                    <b> à l'arrivée au centre de séjour de cohésion.</b>
                  </div>
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="parentConsentment5" />
                <RadioLabel>
                  <Field
                    validate={(v) => !v && requiredMessage}
                    value="true"
                    checked={values.parentConsentment7}
                    type="checkbox"
                    name="parentConsentment7"
                    onChange={handleChange}
                  />
                  <div>
                    {isPlural ? "Nous nous engageons" : "Je m’engage"} à ce que {young.firstName} {young.lastName} soit à jour de ses vaccinations obligatoires*.
                  </div>
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="parentConsentment7" />
                <div style={{ fontWeight: 400, fontSize: 14, margin: "0.8rem" }}>
                  * Les informations relatives au formulaire du droit à l'image, à l'utilisation d'autotest COVID, à la fiche de sanitaire et aux vaccinations seront disponibles
                  dès la confirmation de l'inscription dans l'espace personnel de <strong>{young.firstName}</strong>.
                </div>
              </Col>
            </FormRow>
            <FormRow>
              <Col md={4}>
                <Label>Consentement du volontaire</Label>
              </Col>
              <Col>
                <div>
                  Je,<strong>{` ${young.firstName} ${young.lastName}`}</strong>,
                </div>
                <RadioLabel>
                  <Field validate={(v) => !v && requiredMessage} value="true" checked={values.consentment1} type="checkbox" name="consentment1" onChange={handleChange} />
                  <div>
                    suis volontaire, sous le contrôle de {isPlural ? "mes représentants légaux" : "mon représentant légal"}, pour effectuer à la session 2022 du Service National
                    Universel qui comprend la participation au séjour de cohésion puis la réalisation d'une mission d'intérêt général.
                  </div>
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="consentment1" />
                {age < 15 && (
                  <>
                    <RadioLabel>
                      <Field validate={(v) => !v && requiredMessage} value="true" checked={values.consentment2} type="checkbox" name="consentment2" onChange={handleChange} />
                      <div>
                        <div>accepte la collecte et le traitement de mes données personnelles par l'administration dans le cadre de l'inscription au SNU.</div>
                        <a href="https://www.cnil.fr/fr/recommandation-4-rechercher-le-consentement-dun-parent-pour-les-mineurs-de-moins-de-15-ans" target="_blank">
                          En savoir plus {">"}
                        </a>
                      </div>
                    </RadioLabel>
                    <ErrorMessage errors={errors} touched={touched} name="consentment2" />
                  </>
                )}
              </Col>
            </FormRow>
            <FormFooter loading={loading} values={values} handleSubmit={handleSubmit} errors={errors} />
          </>
        )}
      </Formik>
    </Wrapper>
  );
};

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
    color: #6b7280;
    font-size: 1rem;
  }
`;

const Label = styled.div`
  color: #374151;
  margin-bottom: 10px;
  p {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0;
  }
`;

const RadioLabel = styled.label`
  div {
    width: 100%;
  }
  display: flex;
  align-items: flex-start;
  color: #374151;
  font-size: 14px;
  margin-top: 15px;
  margin-bottom: 0px;
  text-align: left;
  :last-child {
    margin-bottom: 0;
  }
  input {
    cursor: pointer;
    margin-right: 12px;
    margin-top: 3px;
    width: 15px;
    height: 15px;
    min-width: 15px;
    min-height: 15px;
  }
`;

const SubTitle = styled.div`
  margin: 25px 0;
  font-size: 18px;
  font-weight: 700;
`;
