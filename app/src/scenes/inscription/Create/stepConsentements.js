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
import { translate, YOUNG_PHASE, YOUNG_STATUS } from "../../../utils";

export default () => {
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);
  const [clickedRules, setClickedRules] = useState(false);
  const dispatch = useDispatch();
  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }

  const isPlural = () => {
    return young.parent1Status && young.parent2Status;
  };

  const isParentFromFranceConnect = () => {
    if (young.parent1Status && young.parent2Status) {
      return young.parent1FromFranceConnect === "true" && young.parent2FromFranceConnect === "true";
    } else {
      return young.parent1FromFranceConnect === "true";
    }
  };

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
          try {
            console.log(values);
            values.parentConsentment = "true";
            values.consentment = "true";
            if (values.status !== YOUNG_STATUS.WAITING_VALIDATION) {
              values.status = YOUNG_STATUS.WAITING_VALIDATION;
              values.lastStatusAt = Date.now();
              values.historic.push({
                phase: YOUNG_PHASE.INSCRIPTION,
                createdAt: Date.now(),
                userName: `${values.firstName} ${values.lastName}`,
                userId: values._id,
                status: YOUNG_STATUS.WAITING_VALIDATION,
                note: "",
              });
            }
            values.inscriptionStep = STEPS.DONE;
            const { ok, code, data: young } = await api.put("/young", values);
            if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
            dispatch(setYoung(young));
            history.push("/inscription/done");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant le traitement du formulaire :", translate(e.code));
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
                {!isParentFromFranceConnect() && (
                  <>
                    <div style={{ fontWeight: 400, fontSize: 14, margin: "0.8rem" }}>
                      Merci de télécharger le consentement du ou des representants légaux{" "}
                      <a
                        style={{ color: "#5145cd", textDecoration: "underline" }}
                        href="https://apicivique.s3.eu-west-3.amazonaws.com/SNU_-_Consentement_repre%CC%81sentant(s)_le%CC%81gal(aux).pdf"
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
                  </>
                )}
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
                    <strong>{` ${young.firstName} ${young.lastName}`}</strong> à participer à la session 2021 du Service National Universel qui comprend la participation au séjour
                    de cohésion puis la réalisation d'une mission d'intérêt général
                  </div>
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="parentConsentment2" />
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
                  <div>
                    m’engage, sous le contrôle de mon représentant légal, à effectuer à la session 2021 du Service National Universel qui comprend la participation au séjour de
                    cohésion puis la réalisation d'une mission d'intérêt général.
                  </div>
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="consentment1" />
                <RadioLabel>
                  <Field validate={(v) => !v && requiredMessage} value="true" checked={values.consentment2} type="checkbox" name="consentment2" onChange={handleChange} />
                  <div>
                    atteste avoir pris connaissance du règlement intérieur{" "}
                    <a
                      onClick={() => setClickedRules(true)}
                      target="blank"
                      style={{ color: "#5145cd", textDecoration: "underline" }}
                      href="https://apicivique.s3.eu-west-3.amazonaws.com/SNU_-_Re%CC%81glement_inte%CC%81rieur.pdf"
                    >
                      ci-joint
                    </a>{" "}
                    des centres SNU et m’engage à en respecter toutes les dispositions.
                  </div>
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="consentment2" />
              </Col>
            </FormRow>
            <FormFooter values={values} handleSubmit={handleSubmit} errors={errors} />
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

const SubTitle = styled.div`
  margin: 25px 0;
  font-size: 18px;
  font-weight: 700;
`;
