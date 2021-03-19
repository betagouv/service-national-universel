import React, { useEffect } from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { Field, Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import { setYoung } from "../../../redux/auth/actions";
import api from "../../../services/api";
import matomo from "../../../services/matomo";

import ErrorMessage, { requiredMessage } from "../components/errorMessage";
import AddressInput from "../../../components/addressInput";
import DndFileInput from "../../../components/dndFileInput";

import { saveYoung, STEPS } from "../utils";
import { toastr } from "react-redux-toastr";
import { translate } from "../../../utils";

export default () => {
  useEffect(() => {
    matomo.logEvent("inscription", "open_step", "step", 2);
    window.lumiere("sendEvent", "inscription", "open_step", { step: 2 });
  }, []);

  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }

  const handleSave = async (values) => {
    const young = await saveYoung(values);
    if (young) dispatch(setYoung(young));
  };

  return (
    <Wrapper>
      <Heading>
        <h2>Situations particulières</h2>
        <p>Complétez les informations ci-dessous</p>
        <a target="blank" href="https://apicivique.s3.eu-west-3.amazonaws.com/Note_relative_aux_situations_particulie%CC%80res.pdf">
          En savoir plus
        </a>
      </Heading>
      <Formik
        initialValues={young}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            values.inscriptionStep = STEPS.REPRESENTANTS;
            const { ok, code, data: young } = await api.put("/young", values);
            if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
            dispatch(setYoung(young));
            history.push("/inscription/representants");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant le traitement du formulaire :", translate(e.code));
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting, submitForm, errors, touched }) => (
          <>
            <FormLegend>Handicap et pathologies chroniques</FormLegend>
            <FormRow>
              <Col md={4}>
                <Label>Etes-vous en situation de handicap ?</Label>
              </Col>
              <Col>
                <RadioLabel>
                  <Field validate={(v) => !v && requiredMessage} type="radio" name="handicap" value="false" checked={values.handicap === "false"} onChange={handleChange} />
                  Non
                </RadioLabel>
                <RadioLabel>
                  <Field validate={(v) => !v && requiredMessage} type="radio" name="handicap" value="true" checked={values.handicap === "true"} onChange={handleChange} />
                  Oui
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="handicap" />
              </Col>
            </FormRow>
            <FormRow>
              <Col md={4}>
                <Label>
                  Etes-vous bénéficiaire d’un projet personnalisé de scolarisation (PPS)
                  <div>
                    <a href="https://www.service-public.fr/particuliers/vosdroits/F33865" target="_blank">
                      En savoir plus
                    </a>
                  </div>
                </Label>
              </Col>
              <Col>
                <RadioLabel>
                  <Field
                    validate={(v) => !v && requiredMessage}
                    type="radio"
                    name="ppsBeneficiary"
                    value="false"
                    checked={values.ppsBeneficiary === "false"}
                    onChange={handleChange}
                  />
                  Non
                </RadioLabel>
                <RadioLabel>
                  <Field
                    validate={(v) => !v && requiredMessage}
                    type="radio"
                    name="ppsBeneficiary"
                    value="true"
                    checked={values.ppsBeneficiary === "true"}
                    onChange={handleChange}
                  />
                  Oui
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="ppsBeneficiary" />
              </Col>
            </FormRow>
            <FormRow>
              <Col md={4}>
                <Label>
                  Etes-vous bénéficiaire d’un projet d'accueil individualisé (PAI) ?
                  <div>
                    <a href="https://www.service-public.fr/particuliers/vosdroits/F21392" target="_blank">
                      En savoir plus
                    </a>
                  </div>
                </Label>
              </Col>
              <Col>
                <RadioLabel>
                  <Field
                    validate={(v) => !v && requiredMessage}
                    type="radio"
                    name="paiBeneficiary"
                    value="false"
                    checked={values.paiBeneficiary === "false"}
                    onChange={handleChange}
                  />
                  Non
                </RadioLabel>
                <RadioLabel>
                  <Field
                    validate={(v) => !v && requiredMessage}
                    type="radio"
                    name="paiBeneficiary"
                    value="true"
                    checked={values.paiBeneficiary === "true"}
                    onChange={handleChange}
                  />
                  Oui
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="paiBeneficiary" />
              </Col>
            </FormRow>
            {(values["ppsBeneficiary"] === "true" || values["handicap"] === "true") && (
              <>
                <FormRow>
                  <Col md={4}>
                    <Label>Etes-vous suivi par une structure médicosociale ?</Label>
                  </Col>
                  <Col>
                    <RadioLabel>
                      <Field
                        validate={(v) => !v && requiredMessage}
                        type="radio"
                        name="medicosocialStructure"
                        value="false"
                        checked={values.medicosocialStructure === "false"}
                        onChange={handleChange}
                      />
                      Non
                    </RadioLabel>
                    <RadioLabel>
                      <Field
                        validate={(v) => !v && requiredMessage}
                        type="radio"
                        name="medicosocialStructure"
                        value="true"
                        checked={values.medicosocialStructure === "true"}
                        onChange={handleChange}
                      />
                      Oui
                    </RadioLabel>
                    <ErrorMessage errors={errors} touched={touched} name="medicosocialStructure" />
                  </Col>
                </FormRow>
                {values["medicosocialStructure"] === "true" && (
                  <>
                    <FormRow align="center">
                      <Col md={4}>
                        <Label>Nom de la structure</Label>
                      </Col>
                      <Col>
                        <Field
                          class="form-control"
                          validate={(v) => !v && requiredMessage}
                          placeholder="Nom de la structure"
                          name="medicosocialStructureName"
                          value={values.medicosocialStructureName}
                          onChange={handleChange}
                        />
                        <ErrorMessage errors={errors} touched={touched} name="medicosocialStructureName" />
                      </Col>
                    </FormRow>
                    <FormRow>
                      <Col md={4}>
                        <Label>Localisation de la structure</Label>
                      </Col>
                      <Col>
                        <Row>
                          <Col md={12} style={{ marginTop: 15 }}>
                            <Label>Rechercher</Label>
                            <AddressInput
                              keys={{
                                city: "medicosocialStructureCity",
                                zip: "medicosocialStructureZip",
                                address: "medicosocialStructureAddress",
                                location: "medicosocialStructureLocation",
                                department: "medicosocialStructureDepartment",
                                region: "medicosocialStructureRegion",
                              }}
                              values={values}
                              handleChange={handleChange}
                              errors={errors}
                              touched={touched}
                            />
                          </Col>
                        </Row>
                      </Col>
                    </FormRow>
                  </>
                )}
              </>
            )}
            {(values["ppsBeneficiary"] === "true" || values["paiBeneficiary"] === "true" || values["handicap"] === "true") && (
              <>
                <FormRow>
                  <Col md={4}>
                    <Label>
                      Avez-vous besoin d'un aménagement spécifique pour la réalisation du séjour de cohésion ?
                      <div>
                        <span>Affectation à proximité du domicile, participation de jour uniquement, activités sportives adaptées, ...</span>
                      </div>
                    </Label>
                  </Col>
                  <Col>
                    <RadioLabel>
                      <Field
                        validate={(v) => !v && requiredMessage}
                        type="radio"
                        name="specificAmenagment"
                        value="false"
                        checked={values.specificAmenagment === "false"}
                        onChange={handleChange}
                      />
                      Non
                    </RadioLabel>
                    <RadioLabel>
                      <Field
                        validate={(v) => !v && requiredMessage}
                        type="radio"
                        name="specificAmenagment"
                        value="true"
                        checked={values.specificAmenagment === "true"}
                        onChange={handleChange}
                      />
                      Oui
                    </RadioLabel>
                    <ErrorMessage errors={errors} touched={touched} name="specificAmenagment" />
                    {values["specificAmenagment"] === "true" && (
                      <div style={{ fontSize: 14, fontWeight: 400, maxWidth: 500 }}>
                        Le chef de centre vous contactera pour les aménagements nécessaires à votre séjour de cohésion.
                      </div>
                    )}
                  </Col>
                </FormRow>
                {values["specificAmenagment"] === "true" && (
                  <FormRow align="center">
                    <Col md={4}>
                      <Label>Précisez-en la nature</Label>
                    </Col>
                    <Col>
                      <Field
                        placeholder="Affectation à proximité du domicile, participation de jour uniquement, activités sportives adaptées, etc."
                        className="form-control"
                        validate={(v) => !v && requiredMessage}
                        name="specificAmenagmentType"
                        value={values.specificAmenagmentType}
                        onChange={handleChange}
                      />
                      <ErrorMessage errors={errors} touched={touched} name="specificAmenagmentType" />
                    </Col>
                  </FormRow>
                )}
              </>
            )}
            <FormLegend>
              Activités de haut niveau (sport, musique, etc.)
              <p>pour laquelle une participation à un concours, une audition, une compétition est prévue pendant le séjour de cohésion</p>
            </FormLegend>
            <FormRow>
              <Col md={4}>
                <Label>Pratiquez-vous une activité de haut-niveau (sport, musique, théâtre...) ?</Label>
              </Col>
              <Col>
                <RadioLabel>
                  <Field
                    validate={(v) => !v && requiredMessage}
                    type="radio"
                    name="highSkilledActivity"
                    value="false"
                    checked={values.highSkilledActivity === "false"}
                    onChange={handleChange}
                  />
                  Non
                </RadioLabel>
                <RadioLabel>
                  <Field
                    validate={(v) => !v && requiredMessage}
                    type="radio"
                    name="highSkilledActivity"
                    value="true"
                    checked={values.highSkilledActivity === "true"}
                    onChange={handleChange}
                  />
                  Oui
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="highSkilledActivity" />
              </Col>
            </FormRow>
            {values["highSkilledActivity"] === "true" && (
              <>
                <FormRow align="center">
                  <Col md={4}>
                    <Label>Nature de l'activité de haut-niveau</Label>
                  </Col>
                  <Col>
                    <Field
                      placeholder="sport, musique, etc."
                      className="form-control"
                      validate={(v) => !v && requiredMessage}
                      name="highSkilledActivityType"
                      value={values.highSkilledActivityType}
                      onChange={handleChange}
                    />
                    <ErrorMessage errors={errors} touched={touched} name="highSkilledActivityType" />
                  </Col>
                </FormRow>
                <FormRow>
                  <Col md={4}>
                    <Label>En cas de compétition, concours, audition ... prévu(e) pendant le séjour de cohésion, déposez ici votre convocation - justificatif d'engagement</Label>
                  </Col>
                  <Col>
                    <DndFileInput
                      optional
                      value={values.highSkilledActivityProofFiles}
                      name="highSkilledActivityProofFiles"
                      onChange={async (e) => {
                        let { ok, data, code } = await api.uploadFile("/young/file/highSkilledActivityProofFiles", e.target.files);
                        if (code === "FILE_CORRUPTED") {
                          return toastr.error(
                            "Le fichier semble corrompu",
                            "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                            { timeOut: 0 }
                          );
                        }

                        if (!ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                        handleChange({ target: { value: data, name: "highSkilledActivityProofFiles" } });
                        toastr.success("Fichier téléversé");
                      }}
                    />
                    <ErrorMessage errors={errors} touched={touched} name="highSkilledActivityProofFiles" />
                  </Col>
                </FormRow>
              </>
            )}
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
  a {
    color: #5145cd;
    margin-top: 5px;
    font-size: 0.875rem;
    font-weight: 400;
    text-decoration: underline;
  }
  p {
    color: #161e2e;
  }
`;

const FormLegend = styled.div`
  color: #161e2e;
  font-size: 20px;
  font-weight: 700;
  margin-top: 2rem;
  padding: 20px 0;
  p {
    color: #6b7280;
    margin-bottom: 0;
    font-size: 16px;
    font-weight: 400;
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
  font-size: 1em;
  font-weight: 500;
  a {
    color: #5145cd;
    margin-top: 5px;
    font-size: 0.875rem;
    font-weight: 400;
    text-decoration: underline;
  }
  span {
    color: #6b7280;
    margin-top: 5px;
    font-size: 0.875rem;
    font-weight: 400;
  }
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  color: #374151;
  font-size: 14px;
  margin-bottom: 15px;
  :last-child {
    margin-bottom: 0;
  }
  input {
    cursor: pointer;
    margin-right: 12px;
    width: 15px;
    height: 15px;
  }
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
