import React, { useEffect } from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { Field, Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import validator from "validator";
import { useHistory } from "react-router-dom";

import DndFileInput from "../../../components/dndFileInput";
import ErrorMessage, { requiredMessage } from "../components/errorMessage";
import { setYoung } from "../../../redux/auth/actions";
import api from "../../../services/api";
import matomo from "../../../services/matomo";
import { saveYoung, STEPS, YOUNG_SITUATIONS } from "../utils";
import FormRow from "../../../components/form/FormRow";
import AddressInput from "../../../components/addressInput";
import Etablissement from "../components/etablissmentInput";
import { translate } from "../../../utils";
import FormFooter from "../../../components/form/FormFooter";

export default () => {
  useEffect(() => {
    matomo.logEvent("inscription", "open_step", "step", 1);
    window.lumiere("sendEvent", "inscription", "open_step", { step: 1 });
  }, []);

  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }

  const cleanSchoolInformation = (v) => {
    delete v.schoolName;
    delete v.schoolType;
    delete v.schoolAddress;
    delete v.schoolComplementAdresse;
    delete v.schoolZip;
    delete v.schoolCity;
    delete v.schoolDepartment;
    delete v.schoolLocation;
    delete v.schoolId;
  };

  return (
    <Wrapper>
      <Heading>
        <h2>Complétez les coordonnées du volontaire</h2>
        <p>Renseignez ci-dessous vos coordonnées personnelles</p>
      </Heading>
      <Formik
        initialValues={young}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            if (!confirm("Avez-vous bien pensé à téléverser le RECTO et le VERSO de votre pièce d'identité ?")) return;
            values.inscriptionStep = STEPS.PARTICULIERES;
            const { ok, code, data: young } = await api.put("/young", values);
            if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
            dispatch(setYoung(young));
            history.push("/inscription/particulieres");
          } catch (e) {
            console.log(e);
            toastr.error("Erreur !");
          }
        }}
      >
        {({ values, handleChange, handleSubmit, errors, touched }) => (
          <>
            <FormRow>
              <Col md={4}>
                <Label>
                  Pièce d'identité
                  <p>
                    Carte nationale d'identité <b>RECTO-VERSO</b> ou passeport
                  </p>
                  <p>
                    Dans un format <b>lisible</b>
                  </p>
                </Label>
              </Col>
              <Col>
                <DndFileInput
                  placeholder="votre pièce d'identité* (recto-verso)"
                  errorMessage="Vous devez téléverser votre pièce d'identité"
                  value={values.cniFiles}
                  name="cniFiles"
                  onChange={async (e) => {
                    const res = await api.uploadFile("/young/file/cniFiles", e.target.files);

                    if (res.code === "FILE_CORRUPTED") {
                      return toastr.error(
                        "Le fichier semble corrompu",
                        "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                        { timeOut: 0 }
                      );
                    }
                    if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                    // We update it instant ( because the bucket is updated instant )
                    toastr.success("Fichier téléversé");
                    handleChange({ target: { value: res.data, name: "cniFiles" } });
                  }}
                />
                <div style={{ fontSize: "0.8rem", color: "#555", fontStyle: "italic" }}>* Carte nationale d'identité RECTO-VERSO ou passeport</div>
                <ErrorMessage errors={errors} touched={touched} name="cniFiles" />
              </Col>
            </FormRow>
            <FormRow align="center">
              <Col md={4}>
                <Label>Votre téléphone</Label>
              </Col>
              <Col>
                <Field
                  placeholder="Téléphone"
                  className="form-control"
                  validate={(v) =>
                    (!v && requiredMessage) || (!validator.isMobilePhone(v) && "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX")
                  }
                  type="tel"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                />
                <ErrorMessage errors={errors} touched={touched} name="phone" />
              </Col>
            </FormRow>
            <FormRow>
              <Col md={4}>
                <Label>Sexe</Label>
              </Col>
              <Col>
                <RadioLabel>
                  <Field
                    validate={(v) => !v && requiredMessage}
                    className="form-control"
                    type="radio"
                    name="gender"
                    value="female"
                    checked={values.gender === "female"}
                    onChange={handleChange}
                  />
                  Femme
                </RadioLabel>
                <RadioLabel>
                  <Field
                    validate={(v) => !v && requiredMessage}
                    className="form-control"
                    type="radio"
                    name="gender"
                    value="male"
                    checked={values.gender === "male"}
                    onChange={handleChange}
                  />
                  Homme
                </RadioLabel>
                <ErrorMessage errors={errors} touched={touched} name="gender" />
              </Col>
            </FormRow>
            <FormRow>
              <Col md={4}>
                <Label>Lieu de résidence</Label>
              </Col>
              <Col>
                <Row>
                  <Col md={12} style={{ marginTop: 15 }}>
                    <Label>Rechercher</Label>
                    <AddressInput
                      keys={{ city: "city", zip: "zip", address: "address", location: "location", department: "department", region: "region" }}
                      values={values}
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                    />
                  </Col>
                </Row>
              </Col>
            </FormRow>
            <FormRow>
              <Col md={4}>
                <Label>Situation</Label>
              </Col>
              <Col>
                <RadioLabel style={{ fontWeight: "bold" }}>Je suis scolarisé :</RadioLabel>
                <div style={{ marginLeft: "1rem" }}>
                  <RadioLabel>
                    <Field
                      validate={(v) => !v && requiredMessage}
                      className="form-control"
                      type="radio"
                      name="situation"
                      value={YOUNG_SITUATIONS.GENERAL_SCHOOL}
                      checked={values.situation === YOUNG_SITUATIONS.GENERAL_SCHOOL}
                      onChange={handleChange}
                    />
                    en enseignement général ou technologique
                  </RadioLabel>
                  <RadioLabel>
                    <Field
                      validate={(v) => !v && requiredMessage}
                      className="form-control"
                      type="radio"
                      name="situation"
                      value={YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL}
                      checked={values.situation === YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL}
                      onChange={handleChange}
                    />
                    en enseignement professionnel
                  </RadioLabel>
                  <RadioLabel>
                    <Field
                      validate={(v) => !v && requiredMessage}
                      className="form-control"
                      type="radio"
                      name="situation"
                      value={YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL}
                      checked={values.situation === YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL}
                      onChange={handleChange}
                    />
                    en lycée agricole
                  </RadioLabel>
                  <RadioLabel>
                    <Field
                      validate={(v) => !v && requiredMessage}
                      className="form-control"
                      type="radio"
                      name="situation"
                      value={YOUNG_SITUATIONS.SPECIALIZED_SCHOOL}
                      checked={values.situation === YOUNG_SITUATIONS.SPECIALIZED_SCHOOL}
                      onChange={handleChange}
                    />
                    en établissement spécialisé
                  </RadioLabel>
                  <RadioLabel>
                    <Field
                      validate={(v) => !v && requiredMessage}
                      className="form-control"
                      type="radio"
                      name="situation"
                      value={YOUNG_SITUATIONS.APPRENTICESHIP}
                      checked={values.situation === YOUNG_SITUATIONS.APPRENTICESHIP}
                      onChange={handleChange}
                    />
                    en apprentissage
                  </RadioLabel>
                </div>
                {[
                  YOUNG_SITUATIONS.GENERAL_SCHOOL,
                  YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL,
                  YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL,
                  YOUNG_SITUATIONS.SPECIALIZED_SCHOOL,
                  YOUNG_SITUATIONS.APPRENTICESHIP,
                ].includes(values.situation) && (
                  <div style={{ marginBottom: "10px" }}>
                    <RadioLabel style={{ fontWeight: "bold" }}>Trouver votre établissement</RadioLabel>
                    <Etablissement values={values} handleChange={handleChange} />
                  </div>
                )}
                <RadioLabel style={{ fontWeight: "bold" }}>Je suis en emploi :</RadioLabel>
                <div style={{ marginLeft: "1rem" }}>
                  <RadioLabel>
                    <Field
                      onClick={() => cleanSchoolInformation(values)}
                      validate={(v) => !v && requiredMessage}
                      className="form-control"
                      type="radio"
                      name="situation"
                      value={YOUNG_SITUATIONS.EMPLOYEE}
                      checked={values.situation === YOUNG_SITUATIONS.EMPLOYEE}
                      onChange={handleChange}
                    />
                    salarié(e)
                  </RadioLabel>
                  <RadioLabel>
                    <Field
                      onClick={() => cleanSchoolInformation(values)}
                      validate={(v) => !v && requiredMessage}
                      className="form-control"
                      type="radio"
                      name="situation"
                      value={YOUNG_SITUATIONS.INDEPENDANT}
                      checked={values.situation === YOUNG_SITUATIONS.INDEPENDANT}
                      onChange={handleChange}
                    />
                    indépendant(e)
                  </RadioLabel>
                  <RadioLabel>
                    <Field
                      onClick={() => cleanSchoolInformation(values)}
                      validate={(v) => !v && requiredMessage}
                      className="form-control"
                      type="radio"
                      name="situation"
                      value={YOUNG_SITUATIONS.SELF_EMPLOYED}
                      checked={values.situation === YOUNG_SITUATIONS.SELF_EMPLOYED}
                      onChange={handleChange}
                    />
                    auto-entrepreneur
                  </RadioLabel>
                  <RadioLabel>
                    <Field
                      onClick={() => cleanSchoolInformation(values)}
                      validate={(v) => !v && requiredMessage}
                      className="form-control"
                      type="radio"
                      name="situation"
                      value={YOUNG_SITUATIONS.ADAPTED_COMPANY}
                      checked={values.situation === YOUNG_SITUATIONS.ADAPTED_COMPANY}
                      onChange={handleChange}
                    />
                    en ESAT, CAT ou en entreprise adaptée
                  </RadioLabel>
                </div>
                <RadioLabel style={{ fontWeight: "bold" }}>Je suis sans activité :</RadioLabel>
                <div style={{ marginLeft: "1rem" }}>
                  <RadioLabel>
                    <Field
                      onClick={() => cleanSchoolInformation(values)}
                      validate={(v) => !v && requiredMessage}
                      className="form-control"
                      type="radio"
                      name="situation"
                      value={YOUNG_SITUATIONS.POLE_EMPLOI}
                      checked={values.situation === YOUNG_SITUATIONS.POLE_EMPLOI}
                      onChange={handleChange}
                    />
                    inscrit(e) à Pôle emploi
                  </RadioLabel>
                  <RadioLabel>
                    <Field
                      onClick={() => cleanSchoolInformation(values)}
                      validate={(v) => !v && requiredMessage}
                      className="form-control"
                      type="radio"
                      name="situation"
                      value={YOUNG_SITUATIONS.MISSION_LOCALE}
                      checked={values.situation === YOUNG_SITUATIONS.MISSION_LOCALE}
                      onChange={handleChange}
                    />
                    inscrit(e) à la Mission locale
                  </RadioLabel>
                  <RadioLabel>
                    <Field
                      onClick={() => cleanSchoolInformation(values)}
                      validate={(v) => !v && requiredMessage}
                      className="form-control"
                      type="radio"
                      name="situation"
                      value={YOUNG_SITUATIONS.CAP_EMPLOI}
                      checked={values.situation === YOUNG_SITUATIONS.CAP_EMPLOI}
                      onChange={handleChange}
                    />
                    inscrit(e) à Cap emploi
                  </RadioLabel>
                  <RadioLabel>
                    <Field
                      onClick={() => cleanSchoolInformation(values)}
                      validate={(v) => !v && requiredMessage}
                      className="form-control"
                      type="radio"
                      name="situation"
                      value={YOUNG_SITUATIONS.NOTHING}
                      checked={values.situation === YOUNG_SITUATIONS.NOTHING}
                      onChange={handleChange}
                    />
                    inscrit(e) nulle part
                  </RadioLabel>
                </div>
                <ErrorMessage errors={errors} touched={touched} name="situation" />
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
  display: flex;
  align-items: center;
  color: #374151;
  font-size: 14px;
  margin-bottom: 5px;
  :last-child {
    margin-bottom: 15px;
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
