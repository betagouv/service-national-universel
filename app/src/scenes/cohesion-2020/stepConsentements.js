import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { Field, Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import { setYoung } from "../../redux/auth/actions";
import DndFileInput from "../../components/dndFileInput";
import ErrorMessage, { requiredMessage } from "../inscription/components/errorMessage";
import { saveYoung, STEPS_2020 } from "../inscription/utils";

import api from "../../services/api";
import { translate } from "../../utils";

export default () => {
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }

  const handleSave = async (values) => {
    const young = await saveYoung(values);
    if (young) dispatch(setYoung(young));
  };

  const isPlural = () => {
    return young.parent1Status && young.parent2Status;
  };

  console.log(young);

  return (
    <Wrapper>
      <Heading>
        <h2>Consentements</h2>
        <p>Complétez ci-dessous les consentements du volontaire et de ses représentants légaux</p>
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
          try {
            console.log(values);
            values.parentConsentment = "true";
            values.consentment = "true";
            values.cohesion2020Step = STEPS_2020.COORDONNEES;
            const { ok, code, data: young } = await api.put("/young", values);
            if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
            dispatch(setYoung(young));
            history.push("/cohesion/coordonnees");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant le traitement du formulaire :", translate(e.code));
          }
        }}
      >
        {({ values, handleChange, handleSubmit, errors, touched }) => (
          <>
            <FormRow>
              <Col md={4}>
                <Label>Consentement du ou des représentant légaux</Label>
              </Col>
              <Col>
                <div style={{ display: "flex" }}>
                  <div style={{ flex: 1, marginLeft: "0.8rem" }}>
                    <span style={{ fontSize: "12px", fontWeight: "bold", color: "#aaa" }}>REPRÉSENTANT LÉGAL N°1</span>
                    <div style={{ fontWeight: "bold", fontSize: 18 }}>
                      {young.parent1FirstName} {young.parent1LastName}
                    </div>
                  </div>
                  {young.parent2FirstName ? (
                    <div style={{ flex: 1, marginLeft: "0.8rem" }}>
                      <span style={{ fontSize: "12px", fontWeight: "bold", color: "#aaa" }}>REPRÉSENTANT LÉGAL N°2</span>
                      <div style={{ fontWeight: "bold", fontSize: 18 }}>
                        {young.parent2FirstName} {young.parent2LastName}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div style={{ fontWeight: 400, fontSize: 14, margin: "0.8rem" }}>
                  Merci de télécharger le consentement du ou des representants légaux{" "}
                  <a
                    style={{ color: "#5145cd", textDecoration: "underline" }}
                    href="https://apicivique.s3.eu-west-3.amazonaws.com/SNU-_Consentement_du_repre%CC%81sentant_le%CC%81gal_-_2020.pdf"
                    target="blank"
                  >
                    ci-joint
                  </a>{" "}
                  , le compléter, le dater, le signer, le photographier ou le scanner et le déposer ici.
                </div>
                <DndFileInput
                  placeholder="le consentement du ou des representants légaux"
                  errorMessage="Vous devez téléverser le consentement du ou des representants légaux."
                  name="parentConsentmentFiles"
                  value={values.parentConsentmentFiles}
                  onChange={async (e) => {
                    let { data: files, ok, code } = await api.uploadFile("/young/file/parentConsentmentFiles", e.target.files);

                    if (code === "FILE_CORRUPTED") {
                      return toastr.error(
                        "Le fichier semble corrompu",
                        "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                        { timeOut: 0 }
                      );
                    }

                    if (!ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                    handleChange({ target: { value: files, name: "parentConsentmentFiles" } });
                    toastr.success("Fichier téléversé");
                  }}
                />
                <ErrorMessage errors={errors} touched={touched} name="parentConsentmentFiles" />
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
                    {isPlural()
                      ? "Nous confirmons être titulaires de l'autorité parentale/ les représentants légaux de"
                      : "Je confirme être titulaire de l'autorité parentale/ le représentant légal de"}
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
                    {isPlural() ? "Nous autorisons" : "J'autorise"}
                    <strong>{` ${young.firstName} ${young.lastName}`}</strong> à participer à au séjour de cohésion du SNU du 21 juin au 2 juillet 2021.
                  </div>
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="parentConsentment2" />
                <RadioLabel style={{ marginBottom: 3 }}>
                  <Field
                    validate={(v) => !v && requiredMessage}
                    value="true"
                    checked={values.parentConsentment3}
                    type="checkbox"
                    name="parentConsentment3"
                    onChange={handleChange}
                  />
                  <div>{isPlural() ? "Nous nous engageons" : "Je m’engage"} à renseigner le consentement relatif aux droits à l’image* avant le début du séjour de cohésion.</div>
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
                    {isPlural() ? "Nous nous engageons" : "Je m’engage"} à transmettre avant le <b>4 juin 2021</b>, la fiche sanitaire* ainsi que les documents médicaux et
                    justificatifs nécessaires.
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
                  <div>{isPlural() ? "Nous nous engageons" : "Je m’engage"} à ce que mon enfant soit à jour de ses vaccinations obligatoires*.</div>
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="parentConsentment5" />
                <div style={{ fontWeight: 400, fontSize: 14, margin: "0.8rem" }}>
                  * Les informations relatives au formulaire du droit à l'image, à la fiche de sanitaire et aux vaccinations seront disponibles dès la confirmation de l'inscription
                  dans l'espace personnel de <strong>{young.firstName}</strong>.
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
                  <div>Je m’engage, sous le contrôle de mon représentant légal, à effectuer le séjour de cohésion du 21 juin au 2 juillet 2021.</div>
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="consentment1" />
              </Col>
            </FormRow>
            <Footer>
              <ButtonContainer>
                <SaveButton onClick={() => handleSave(values)}>Enregistrer</SaveButton>
                <ContinueButton onClick={handleSubmit}>Continuer</ContinueButton>
              </ButtonContainer>
              {Object.keys(errors).length ? <h3>Vous ne pouvez passer à l'étape suivante car tous les champs ne sont pas correctement renseignés.</h3> : null}
            </Footer>
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
    color: #161e2e;
    font-size: 1rem;
  }
`;

const FormRow = styled(Row)`
  border-bottom: 1px solid #e5e7eb;
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: ${({ align }) => align};
  text-align: left;
  input[type="text"] {
    max-width: 500px;
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
const Warning = styled.div`
  background-color: #88001711;
  border-radius: 0.5rem;
  border: 1px solid #880017;
  padding: 0.5rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  img {
    height: 1rem;
    margin: 0.5rem;
  }
  p {
    color: #880017;
    font-size: 0.8rem;
  }
`;

const RadioLabel = styled.label`
  div {
    width: 100%;
  }
  display: flex;
  align-items: center;
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
    width: 15px;
    height: 15px;
    min-width: 15px;
    min-height: 15px;
  }
`;
const List = styled.ul`
  list-style: disc;
  padding-left: 40px;
  font-size: 14px;
  color: #374151;
  font-weight: 400;
  li {
    margin-bottom: 5px;
  }
`;
const SubTitle = styled.div`
  margin: 25px 0;
  font-size: 18px;
  font-weight: 700;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  h3 {
    border: 1px solid #fc8181;
    border-radius: 0.25em;
    margin-top: 1em;
    background-color: #fff5f5;
    color: #c53030;
    font-weight: 400;
    font-size: 12px;
    padding: 1em;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContinueButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 20px;
  margin-right: 10px;
  margin-top: 40px;
  display: block;
  width: 140px;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;

const SaveButton = styled(ContinueButton)`
  color: #374151;
  background-color: #f9fafb;
  border-width: 1px;
  border-color: transparent;
`;
