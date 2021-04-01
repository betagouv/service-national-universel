import React from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { Field, Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import { setYoung } from "../../redux/auth/actions";
import api from "../../services/api";
import matomo from "../../services/matomo";
import ErrorMessage, { requiredMessage } from "../inscription/components/errorMessage";
import AddressInput from "../../components/addressInput";
import DndFileInput from "../../components/dndFileInput";
import { STEPS_2020 } from "../inscription/utils";
import { toastr } from "react-redux-toastr";
import { translate } from "../../utils";
import FormFooter from "../../components/form/FormFooter";
import FormRadioLabelTrueFalse from "../../components/form/FormRadioLabelTrueFalse";
import FormLegend from "../../components/form/FormLegend";
import FormRow from "../../components/form/FormRow";

export default () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }

  return (
    <Wrapper>
      <Heading>
        <h2>Situations particulières</h2>
        <p>Vérifiez et actualisez les informations ci-dessous si besoin</p>
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
            values.cohesion2020Step = STEPS_2020.JDC;
            const { ok, code, data: young } = await api.put("/young", values);
            if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
            dispatch(setYoung(young));
            history.push("/cohesion/jdc");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant le traitement du formulaire :", translate(e.code));
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting, submitForm, errors, touched }) => (
          <>
            <FormLegend>Handicap et pathologies chroniques</FormLegend>
            <FormRadioLabelTrueFalse title="Etes-vous en situation de handicap ?" name="handicap" values={values} handleChange={handleChange} errors={errors} touched={touched} />
            <FormRadioLabelTrueFalse
              title="Etes-vous bénéficiaire d’un projet personnalisé de scolarisation (PPS)"
              name="ppsBeneficiary"
              values={values}
              handleChange={handleChange}
              errors={errors}
              touched={touched}
            >
              <div>
                <a href="https://www.service-public.fr/particuliers/vosdroits/F33865" target="_blank">
                  En savoir plus
                </a>
              </div>
            </FormRadioLabelTrueFalse>
            <FormRadioLabelTrueFalse
              title="Etes-vous bénéficiaire d’un projet d'accueil individualisé (PAI) ?"
              name="paiBeneficiary"
              values={values}
              handleChange={handleChange}
              errors={errors}
              touched={touched}
            >
              <div>
                <a href="https://www.service-public.fr/particuliers/vosdroits/F21392" target="_blank">
                  En savoir plus
                </a>
              </div>
            </FormRadioLabelTrueFalse>
            {(values["ppsBeneficiary"] === "true" || values["handicap"] === "true") && (
              <>
                <FormRadioLabelTrueFalse
                  title="Etes-vous suivi par une structure médicosociale ?"
                  name="medicosocialStructure"
                  values={values}
                  handleChange={handleChange}
                  errors={errors}
                  touched={touched}
                />
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
                <FormRadioLabelTrueFalse
                  title="Avez-vous besoin d'un aménagement spécifique pour la réalisation du séjour de cohésion ?"
                  name="specificAmenagment"
                  values={values}
                  handleChange={handleChange}
                  errors={errors}
                  touched={touched}
                >
                  <div className="info">Affectation à proximité du domicile, participation de jour uniquement, activités sportives adaptées, ...</div>
                  {values["specificAmenagment"] === "true" && (
                    <div className="info" style={{ marginTop: "1rem" }}>
                      Le chef de centre vous contactera pour les aménagements nécessaires à votre séjour de cohésion.
                    </div>
                  )}
                </FormRadioLabelTrueFalse>
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
            <FormRadioLabelTrueFalse
              title="Pratiquez-vous une activité de haut-niveau (sport, musique, théâtre...) ?"
              name="highSkilledActivity"
              values={values}
              handleChange={handleChange}
              errors={errors}
              touched={touched}
            />
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
            <FormFooter values={values} handleSubmit={handleSubmit} errors={errors} />
          </>
        )}
      </Formik>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 40px;
  width: 100%;
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
