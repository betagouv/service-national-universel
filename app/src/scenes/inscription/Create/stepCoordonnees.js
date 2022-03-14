import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { Field, Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import validator from "validator";
import { useHistory } from "react-router-dom";

import ErrorMessage, { requiredMessage } from "../components/errorMessage";
import { setYoung } from "../../../redux/auth/actions";
import api from "../../../services/api";
import { YOUNG_SITUATIONS } from "../utils";
import FormRow from "../../../components/form/FormRow";
import AddressInputV2 from "../../../components/addressInputV2";
import Etablissement from "../components/etablissmentInput";
import { translate } from "../../../utils";
import FormFooter from "../../../components/form/FormFooter";
import InfoIcon from "../../../components/InfoIcon";

export default function StepCoordonnees() {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);
  const [data, setData] = useState();

  const [loading, setLoading] = useState(false);

  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }

  useEffect(() => {
    if (young !== undefined) {
      setData({
        gender: young.gender,
        phone: young.phone,
        country: young.country,
        city: young.city,
        zip: young.zip,
        address: young.address,
        location: young.location,
        department: young.department,
        region: young.region,
        cityCode: young.cityCode,
        academy: young.academy,
        addressVerified: young.addressVerified,
        hostLastName: young.hostLastName,
        hostFirstName: young.hostFirstName,
        hostRelationship: young.hostRelationship,
        foreignCountry: young.foreignCountry,
        foreignCity: young.foreignCountry,
        foreignZip: young.foreignZip,
        foreignAddress: young.foreignAddress,
        schooled: young.schooled,
        situation: young.situation,
        employed: young.employed,
        schoolName: young.schoolName,
        grade: young.grade,
        schoolId: young.schoolId,
        schoolCountry: young.schoolCountry,
        schoolCity: young.schoolCity,
        schoolDepartment: young.schoolDepartment,
      });
      if (young.foreignCountry) {
        setData((data) => ({ ...data, livesInFrance: "false" }));
      } else {
        setData((data) => ({ ...data, livesInFrance: "true" }));
      }
    } else {
      history.push("/inscription/profil");
    }
  }, [young]);

  if (!data) return null;

  const cleanSchoolInformation = (v) => {
    delete v.schoolType;
    delete v.schoolAddress;
    delete v.schoolComplementAdresse;
    delete v.schoolZip;
    delete v.schoolCity;
    delete v.schoolDepartment;
    delete v.schoolLocation;
    delete v.schoolId;
    delete v.schoolName;
    delete v.schoolCountry;
    delete v.grade;
  };

  const cleanAllAddressInformation = (callback) => {
    callback({ target: { name: "hostLastName", value: "" } });
    callback({ target: { name: "hostFirstName", value: "" } });
    callback({ target: { name: "hostRelationship", value: "" } });
    callback({ target: { name: "foreignAddress", value: "" } });
    callback({ target: { name: "foreignCity", value: "" } });
    callback({ target: { name: "foreignZip", value: "" } });
    callback({ target: { name: "city", value: "" } });
    callback({ target: { name: "zip", value: "" } });
    callback({ target: { name: "department", value: "" } });
    callback({ target: { name: "region", value: "" } });
    callback({ target: { name: "address", value: "" } });
    callback({ target: { name: "location", value: {} } });
    callback({ target: { name: "cityCode", value: "" } });
    callback({ target: { name: "addressVerified", value: "" } });
    // we do not reinit the country
  };

  const cleanSituation = (v) => {
    delete v.situation;
    delete v.schoolType;
    delete v.schoolAddress;
    delete v.schoolZip;
    delete v.schoolCity;
    delete v.schoolCountry;
    delete v.schoolDepartment;
    delete v.schoolLocation;
    delete v.schoolId;
    delete v.schoolName;
    delete v.employed;
    v.grade = "";
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      if (values.livesInFrance === "true") {
        delete values.foreignAddress;
        delete values.foreignCity;
        delete values.foreignCountry;
        delete values.foreignZip;
        delete values.hostFirstName;
        delete values.hostLastName;
        delete values.hostRelationship;
      }
      const { ok, code, data } = await api.put("/young/inscription/coordonnee", values);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      dispatch(setYoung(data));
      history.push("/inscription/availability");
    } catch (e) {
      console.log(e);
      toastr.error("Erreur !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Heading>
        <h2>Complétez les coordonnées du volontaire</h2>
        <p>Renseignez ci-dessous vos coordonnées personnelles</p>
      </Heading>
      <Formik
        initialValues={data}
        validate={(values) => {
          const errors = {};
          const needsEtablissement = [
            YOUNG_SITUATIONS.GENERAL_SCHOOL,
            YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL,
            YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL,
            YOUNG_SITUATIONS.SPECIALIZED_SCHOOL,
            YOUNG_SITUATIONS.APPRENTICESHIP,
          ].includes(values.situation);
          if (needsEtablissement && !values.schoolName) errors.schoolName = "Un établissement est obligatoire";
          if (needsEtablissement && values.schoolCountry === "France" && !values.schoolCity) errors.schoolCity = "Une ville est obligatoire";
          return errors;
        }}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={(values) => onSubmit(values)}>
        {({ values, handleChange, handleSubmit, errors, touched, validateField, setFieldValue }) => {
          useEffect(() => {
            if (values.phone) validateField("phone");
          }, [values.phone]);
          return (
            <>
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
                </Col>
                <Col>
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
                  <Label>Lieu de résidence</Label>
                </Col>
                <Col sm={12} md={4}>
                  <RadioLabel>
                    <Field
                      validate={(v) => !v && requiredMessage}
                      className="form-control"
                      type="radio"
                      name="livesInFrance"
                      value="true"
                      checked={values.livesInFrance === "true"}
                      onChange={handleChange}
                      // eslint-disable-next-line react/jsx-no-duplicate-props
                      onChange={(e) => {
                        const value = e.target.value;
                        handleChange({ target: { name: "livesInFrance", value } });
                        handleChange({ target: { name: "foreignCountry", value: "" } });
                        cleanAllAddressInformation(handleChange);
                      }}
                    />
                    Je réside en France métropolitaine ou d&apos;Outre-Mer
                  </RadioLabel>
                  <ErrorMessage errors={errors} touched={touched} name="livesInFrance" />
                </Col>
                <Col sm={12} md={4}>
                  <RadioLabel>
                    <Field
                      validate={(v) => !v && requiredMessage}
                      className="form-control"
                      type="radio"
                      name="livesInFrance"
                      value="false"
                      checked={values.livesInFrance === "false"}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleChange({ target: { name: "livesInFrance", value } });
                        handleChange({ target: { name: "foreignCountry", value: "" } });
                        cleanAllAddressInformation(handleChange);
                      }}
                    />
                    Je réside à l&apos;étranger
                  </RadioLabel>
                </Col>
              </FormRow>
              {values.livesInFrance === "true" ? (
                // if the young lives in France, we store the information in the default fields (country, city, zip, address, location, department, region)
                <FormRow>
                  <Col md={4}></Col>
                  <Col>
                    <AddressInputV2
                      countryByDefault="France"
                      onChangeCountry={() => {
                        cleanAllAddressInformation(handleChange);
                      }}
                      keys={{
                        country: "country",
                        city: "city",
                        zip: "zip",
                        address: "address",
                        location: "location",
                        department: "department",
                        region: "region",
                        cityCode: "cityCode",
                        academy: "academy",
                        addressVerified: "addressVerified",
                      }}
                      values={values}
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      validateField={validateField}
                    />
                  </Col>
                </FormRow>
              ) : (
                // if the young lives in a foreign country, we store the information in the foreign fields
                // and we store the host's informations in the default fields
                <>
                  <FormRow>
                    <Col md={4}>
                      <Label>Adresse à l&apos;étranger</Label>
                      <Infos>
                        <InfoIcon color="#32257F" />
                        <p>
                          Si vous résidez en France d&apos;Outre-Mer, merci de sélectionner:{" "}
                          <b>
                            <i>&quot;Je réside en France métropolitaine ou d&apos;Outre-Mer&quot;</i>
                          </b>
                        </p>
                      </Infos>
                    </Col>
                    <Col>
                      <AddressInputV2
                        onChangeCountry={() => {
                          cleanAllAddressInformation(handleChange);
                        }}
                        keys={{
                          country: "foreignCountry",
                          city: "foreignCity",
                          zip: "foreignZip",
                          address: "foreignAddress",
                        }}
                        values={values}
                        handleChange={handleChange}
                        errors={errors}
                        touched={touched}
                        countryVisible
                        validateField={validateField}
                      />
                    </Col>
                  </FormRow>
                  <FormRow>
                    <Col md={4}>
                      <Label>Identité et adresse de l&apos;hébergeur en France</Label>
                      <Infos>
                        <InfoIcon color="#32257F" />
                        <p>Proche chez qui vous séjournerez le temps de la réalisation de votre SNU (lieu de départ/retour pour le séjour et de réalisation de la MIG).</p>
                      </Infos>
                      <Note>
                        A noter : l’hébergement chez un proche en France ainsi que le transport entre votre lieu de résidence et celui de votre hébergeur sont à votre charge.
                      </Note>
                    </Col>
                    <Col>
                      <SecondLabel>Nom de l&apos;hébergeur</SecondLabel>
                      <Row>
                        <Col>
                          <Field
                            placeholder="Nom de l'hébergeur"
                            className="form-control"
                            validate={(v) => !v && requiredMessage}
                            name="hostLastName"
                            value={values.hostLastName}
                            onChange={handleChange}
                          />
                          <ErrorMessage errors={errors} touched={touched} name="hostLastName" />
                        </Col>
                        <Col>
                          <Field
                            placeholder="Prénom de l'hébergeur"
                            className="form-control"
                            validate={(v) => !v && requiredMessage}
                            name="hostFirstName"
                            value={values.hostFirstName}
                            onChange={handleChange}
                          />
                          <ErrorMessage errors={errors} touched={touched} name="hostFirstName" />
                        </Col>
                      </Row>
                      <SecondLabel style={{ marginTop: 15 }}>Lien avec l&apos;hébergeur</SecondLabel>
                      <Field
                        as="select"
                        validate={(v) => !v && requiredMessage}
                        className="form-control"
                        name="hostRelationship"
                        value={values.hostRelationship}
                        onChange={handleChange}>
                        <option value={""} disabled>
                          Précisez votre lien avec l&apos;hébergeur
                        </option>
                        {[
                          { label: "Parent", value: "Parent" },
                          { label: "Frère/Soeur", value: "Frere/Soeur" },
                          { label: "Grand-parent", value: "Grand-parent" },
                          { label: "Oncle/Tante", value: "Oncle/Tante" },
                          { label: "Ami de la famille", value: "Ami de la famille" },
                          { label: "Autre", value: "Autre" },
                        ].map((e) => (
                          <option key={e.value} value={e.value}>
                            {e.label}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage errors={errors} touched={touched} name="hostRelationship" />
                      <AddressInputV2
                        countryByDefault="France"
                        keys={{
                          country: "country",
                          city: "city",
                          zip: "zip",
                          address: "address",
                          location: "location",
                          department: "department",
                          region: "region",
                          cityCode: "cityCode",
                          academy: "academy",
                          addressVerified: "addressVerified",
                        }}
                        values={values}
                        departAndRegionVisible={false}
                        handleChange={handleChange}
                        errors={errors}
                        touched={touched}
                        validateField={validateField}
                      />
                    </Col>
                  </FormRow>
                </>
              )}
              <FormRow>
                <Col md={4}>
                  <Label>Situation</Label>
                </Col>
                <Col>
                  <RadioLabel style={{ fontWeight: "bold" }}>Je suis scolarisé(e) :</RadioLabel>
                  <div style={{ marginLeft: "1rem" }}>
                    <RadioLabel>
                      <Field
                        validate={(v) => !v && requiredMessage}
                        className="form-control"
                        type="radio"
                        name="schooled"
                        value="true"
                        checked={values.schooled === "true"}
                        onChange={handleChange}
                        onClick={() => cleanSituation(values)}
                      />
                      Oui
                    </RadioLabel>
                    <RadioLabel>
                      <Field
                        validate={(v) => !v && requiredMessage}
                        className="form-control"
                        type="radio"
                        name="schooled"
                        value="false"
                        checked={values.schooled === "false"}
                        onChange={handleChange}
                        onClick={() => cleanSituation(values)}
                      />
                      Non
                    </RadioLabel>
                  </div>
                  {values.schooled === "true" && (
                    <>
                      <RadioLabel style={{ fontWeight: "bold" }}>Précisez: </RadioLabel>
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
                          <Etablissement
                            setFieldValue={setFieldValue}
                            values={values}
                            handleChange={handleChange}
                            errors={errors}
                            touched={touched}
                            keys={{
                              schoolName: "schoolName",
                              grade: "grade",
                              schoolId: "schoolId",
                              schoolCountry: "schoolCountry",
                              schoolCity: "schoolCity",
                              schoolDepartment: "schoolDepartment",
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                  {values.schooled === "false" && (
                    <>
                      <RadioLabel style={{ fontWeight: "bold" }}>Je suis en emploi: </RadioLabel>
                      <div style={{ marginLeft: "1rem" }}>
                        <RadioLabel>
                          <Field
                            validate={(v) => !v && requiredMessage}
                            className="form-control"
                            type="radio"
                            name="employed"
                            value="true"
                            checked={values.employed === "true"}
                            onChange={handleChange}
                            onClick={() => delete values.situation}
                          />
                          Oui
                        </RadioLabel>
                        <RadioLabel>
                          <Field
                            validate={(v) => !v && requiredMessage}
                            className="form-control"
                            type="radio"
                            name="employed"
                            value="false"
                            checked={values.employed === "false"}
                            onChange={handleChange}
                            onClick={() => delete values.situation}
                          />
                          Non
                        </RadioLabel>
                        <ErrorMessage errors={errors} touched={touched} name="employed" />
                      </div>
                      {values.employed === "true" && (
                        <>
                          <RadioLabel style={{ fontWeight: "bold" }}>Précisez : </RadioLabel>
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
                        </>
                      )}
                      {values.employed === "false" && (
                        <>
                          <RadioLabel style={{ fontWeight: "bold" }}>Je suis sans activité: </RadioLabel>
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
                        </>
                      )}
                    </>
                  )}
                  <ErrorMessage errors={errors} touched={touched} name="situation" />
                </Col>
              </FormRow>
              <FormFooter loading={loading} values={values} handleSubmit={handleSubmit} errors={errors} />
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
`;

const Label = styled.div`
  color: #374151;
  margin-bottom: 10px;
  font-weight: bold;
  p {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0;
  }
`;

const Infos = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-start;
  background: rgba(79, 70, 229, 0.1);
  padding: 1rem;
  color: #32257f;
  border-radius: 6px;
  svg {
    margin-top: 4px;
  }
  p {
    flex: 1;
  }
`;

const Note = styled.p`
  margin-top: 1rem;
  padding: 0.2rem;
  color: #6b7280;
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

const SecondLabel = styled.div`
  color: #374151;
  font-size: 14px;
  margin-bottom: 10px;
`;
