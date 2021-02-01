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

import AddressInput from "../components/addressInput";
import Etablissement from "../components/etablissmentInput";
import { translate } from "../../../utils";

export default () => {
  useEffect(() => {
    matomo.logEvent("inscription", "open_step", "step", 1);
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
                <Label>Pièce d'identité</Label>
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
                <div style={{ fontSize: "0.8rem", color: "#555", fontStyle: "italic" }}>* Carte nationale d'identité ou passeport</div>
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
