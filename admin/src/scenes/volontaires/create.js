import React from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { Field, Formik } from "formik";
import "dayjs/locale/fr";
import { useSelector } from "react-redux";

import LoadingButton from "../../components/buttons/LoadingButton";
import DateInput from "../../components/dateInput";
import { departmentList, regionList, translate } from "../../utils";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import DndFileInput from "../../components/dndFileInput";
import Error, { requiredMessage } from "../../components/errorMessage";

export default (props) => {
  const history = useHistory();

  return (
    //@todo fix the depart and region
    <Wrapper>
      <Formik
        initialValues={{
          status: "VALIDATED",
          firstName: "",
          lastName: "",
          birthdateAt: "",
          cniFiles: [],
          email: "",
          phone: "",
          address: "",
          city: "",
          zip: "",
          department: "",
          region: "",
          parentConsentmentFiles: [],
        }}
        onSubmit={async (values) => {
          try {
            const { ok, code, data: young } = await api.post("/referent/young", values);
            if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
            toastr.success("Volontaire créé !");
            return history.push("/inscription");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la création du volontaire :", translate(e.code));
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting, submitForm, errors, touched }) => (
          <>
            <TitleWrapper>
              <div>
                <Title>{`Création du profil ${values.firstName ? `de ${values.firstName}  ${values.lastName}` : ""}`}</Title>
              </div>
              <SaveBtn loading={isSubmitting} onClick={handleSubmit}>
                Valider cette candidature
              </SaveBtn>
            </TitleWrapper>
            <Row>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxTitle>Identité</BoxTitle>
                  <BoxContent direction="column">
                    <Item title="Nom" values={values} name={"lastName"} handleChange={handleChange} required errors={errors} touched={touched} />
                    <Item title="Prénom" values={values} name="firstName" handleChange={handleChange} required errors={errors} touched={touched} />
                    <Item title="Date de naissance" type="date" values={values} name="birthdateAt" handleChange={handleChange} />
                    <Documents>
                      <h4>Pièces d'identité</h4>
                      <DndFileInput
                        placeholder="une pièce d'identité"
                        errorMessage="Vous devez téléverser une pièce d'identité"
                        value={values.cniFiles}
                        source={(e) => api.get(`/referent/youngFile/${values._id}/cniFiles/${e}`)}
                        name="cniFiles"
                        onChange={async (e) => {
                          const res = await api.uploadFile("/referent/file/cniFiles", e.target.files, { youngId: values._id });
                          if (res.code === "FILE_CORRUPTED") {
                            return toastr.error(
                              "Le fichier semble corrompu",
                              "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                              { timeOut: 0 }
                            );
                          }
                          if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                          // We update and save it instant.
                          handleChange({ target: { value: res.data, name: "cniFiles" } });
                          handleSubmit();
                        }}
                      />
                    </Documents>
                  </BoxContent>
                </Box>
              </Col>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxTitle>Coordonnées</BoxTitle>
                  <BoxContent direction="column">
                    <Item title="E-mail" values={values} name="email" handleChange={handleChange} required errors={errors} touched={touched} />
                    <Item title="Tél." values={values} name="phone" handleChange={handleChange} />
                    <Item title="Adresse" values={values} name="address" handleChange={handleChange} />
                    <Item title="Ville" values={values} name="city" handleChange={handleChange} />
                    <Item title="Code Postal" values={values} name="zip" handleChange={handleChange} />
                    <Select name="department" values={values} handleChange={handleChange} title="Département" options={departmentList.map((d) => ({ value: d, label: d }))} />
                    <Select name="region" values={values} handleChange={handleChange} title="Région" options={regionList.map((r) => ({ value: r, label: r }))} />
                  </BoxContent>
                </Box>
              </Col>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxTitle>Situation</BoxTitle>
                  <BoxContent direction="column">
                    <Item title="Status" values={values} name="situation" handleChange={handleChange} />
                    <Item title="Type" values={values} name="schoolType" handleChange={handleChange} />
                    <Item title="Nom" values={values} name="schoolName" handleChange={handleChange} />
                    <Item title="Adresse" values={values} name="schoolAddress" handleChange={handleChange} />
                    <Item title="Ville" values={values} name="schoolCity" handleChange={handleChange} />
                    <Item title="Code Postal" values={values} name="schoolZip" handleChange={handleChange} />
                    <Select name="schoolDepartment" values={values} handleChange={handleChange} title="Département" options={departmentList.map((d) => ({ value: d, label: d }))} />
                    <Select name="schoolRegion" values={values} handleChange={handleChange} title="Région" options={regionList.map((r) => ({ value: r, label: r }))} />
                  </BoxContent>
                </Box>
              </Col>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxTitle>Situations particulières</BoxTitle>
                  <BoxContent direction="column">
                    <Item disabled title="Quartier Prioritaire de la Ville" values={values} name="qpv" />
                    <Select
                      name="handicap"
                      values={values}
                      handleChange={handleChange}
                      title="Situation de Handicap"
                      options={[
                        { value: "true", label: "Oui" },
                        { value: "false", label: "Non" },
                      ]}
                    />
                    <Select
                      name="ppsBeneficiary"
                      values={values}
                      handleChange={handleChange}
                      title="Bénéficiaire d'un PPS"
                      options={[
                        { value: "true", label: "Oui" },
                        { value: "false", label: "Non" },
                      ]}
                    />
                    <Select
                      name="paiBeneficiary"
                      values={values}
                      handleChange={handleChange}
                      title="Bénéficiaire d'un PAI"
                      options={[
                        { value: "true", label: "Oui" },
                        { value: "false", label: "Non" },
                      ]}
                    />
                    <Select
                      disabled={values.ppsBeneficiary !== "true" && values.paiBeneficiary !== "true" && values.handicap !== "true"}
                      name="specificAmenagment"
                      values={values}
                      handleChange={handleChange}
                      title="Aménagement spécifique"
                      options={[
                        { value: "true", label: "Oui" },
                        { value: "false", label: "Non" },
                      ]}
                    />
                    <Item
                      disabled={values.specificAmenagment !== "true"}
                      title="Nature de l'aménagement spécifique"
                      values={values}
                      name="specificAmenagmentType"
                      handleChange={handleChange}
                    />
                    <Select
                      disabled={values.ppsBeneficiary !== "true" && values.handicap !== "true"}
                      name="medicosocialStructure"
                      values={values}
                      handleChange={handleChange}
                      title="Suivi médicosocial"
                      options={[
                        { value: "true", label: "Oui" },
                        { value: "false", label: "Non" },
                      ]}
                    />
                    <Item
                      disabled={values.medicosocialStructure !== "true"}
                      title="Nom de la structure médicosociale"
                      values={values}
                      name="medicosocialStructureName"
                      handleChange={handleChange}
                    />
                    <Item
                      title="Adresse de la structure médicosociale"
                      values={values}
                      name="medicosocialStructureAddress"
                      handleChange={handleChange}
                      disabled={values.medicosocialStructure !== "true"}
                    />
                    <Item
                      title="Ville de la structure médicosociale"
                      values={values}
                      name="medicosocialStructureCity"
                      handleChange={handleChange}
                      disabled={values.medicosocialStructure !== "true"}
                    />
                    <Item
                      title="Code Postal de la structure médicosociale"
                      values={values}
                      name="medicosocialStructureZip"
                      handleChange={handleChange}
                      disabled={values.medicosocialStructure !== "true"}
                    />
                    <Select
                      disabled={values.medicosocialStructure !== "true"}
                      name="medicosocialStructureDepartment"
                      values={values}
                      handleChange={handleChange}
                      title="Département de la structure médicosociale"
                      options={departmentList.map((d) => ({ value: d, label: d }))}
                    />
                    <Select
                      disabled={values.medicosocialStructure !== "true"}
                      name="medicosocialStructureRegion"
                      values={values}
                      handleChange={handleChange}
                      title="Région de la structure médicosociale"
                      options={regionList.map((r) => ({ value: r, label: r }))}
                    />
                    <Select
                      name="highSkilledActivity"
                      values={values}
                      handleChange={handleChange}
                      title="Activités de haut niveau"
                      options={[
                        { value: "true", label: "Oui" },
                        { value: "false", label: "Non" },
                      ]}
                    />
                    <Item
                      disabled={values.highSkilledActivity !== "true"}
                      title="Nature de l'activité de haut-niveau"
                      values={values}
                      name="highSkilledActivityType"
                      handleChange={handleChange}
                    />
                    <Documents>
                      <h4>Documents justificatifs</h4>
                      <DndFileInput
                        placeholder="un document justificatif"
                        errorMessage="Vous devez téléverser un document justificatif"
                        value={values.highSkilledActivityProofFiles}
                        source={(e) => api.get(`/referent/youngFile/${values._id}/highSkilledActivityProofFiles/${e}`)}
                        name="cniFiles"
                        onChange={async (e) => {
                          const res = await api.uploadFile("/referent/file/highSkilledActivityProofFiles", e.target.files, { youngId: values._id });
                          if (res.code === "FILE_CORRUPTED") {
                            return toastr.error(
                              "Le fichier semble corrompu",
                              "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                              { timeOut: 0 }
                            );
                          }
                          if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                          // We update and save it instant.
                          handleChange({ target: { value: res.data, name: "highSkilledActivityProofFiles" } });
                          handleSubmit();
                        }}
                      />
                    </Documents>
                  </BoxContent>
                </Box>
              </Col>
            </Row>
            <Row>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxTitle>Représentant Légal n°1</BoxTitle>
                  <BoxContent direction="column">
                    <Select
                      name="parent1Status"
                      values={values}
                      handleChange={handleChange}
                      title="Statut"
                      options={[
                        { value: "mother", label: "Mère" },
                        { value: "father", label: "Père" },
                        { value: "representant", label: "Représentant légal" },
                      ]}
                    />
                    <Item title="Prénom" values={values} name="parent1FirstName" handleChange={handleChange} />
                    <Item title="Nom" values={values} name="parent1LastName" handleChange={handleChange} />
                    <Item title="E-mail" values={values} name="parent1Email" handleChange={handleChange} />
                    <Item title="Tél." values={values} name="parent1Phone" handleChange={handleChange} />
                    <Select
                      name="parent1OwnAddress"
                      values={values}
                      handleChange={handleChange}
                      title="Adresse differente de celle du volontaire"
                      options={[
                        { value: "true", label: "Oui" },
                        { value: "false", label: "Non" },
                      ]}
                    />
                    <Item disabled={values.parent1OwnAddress !== "true"} title="Adresse" values={values} name="parent1Address" handleChange={handleChange} />
                    <Item disabled={values.parent1OwnAddress !== "true"} title="Ville" values={values} name="parent1City" handleChange={handleChange} />
                    <Item disabled={values.parent1OwnAddress !== "true"} title="Code Postal" values={values} name="parent1Zip" handleChange={handleChange} />
                    <Select
                      disabled={values.parent1OwnAddress !== "true"}
                      name="parent1Department"
                      values={values}
                      handleChange={handleChange}
                      title="Département"
                      options={departmentList.map((d) => ({ value: d, label: d }))}
                    />
                    <Select
                      disabled={values.parent1OwnAddress !== "true"}
                      name="parent1Region"
                      values={values}
                      handleChange={handleChange}
                      title="Région"
                      options={regionList.map((r) => ({ value: r, label: r }))}
                    />
                  </BoxContent>
                </Box>
              </Col>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxTitle>Représentant Légal n°2</BoxTitle>
                  <BoxContent direction="column">
                    <Select
                      name="parent2Status"
                      values={values}
                      handleChange={handleChange}
                      title="Statut"
                      options={[
                        { value: "mother", label: "Mère" },
                        { value: "father", label: "Père" },
                        { value: "representant", label: "Représentant légal" },
                      ]}
                    />
                    <Item title="Prénom" values={values} name="parent2FirstName" handleChange={handleChange} />
                    <Item title="Nom" values={values} name="parent2LastName" handleChange={handleChange} />
                    <Item title="E-mail" values={values} name="parent2Email" handleChange={handleChange} />
                    <Item title="Tél." values={values} name="parent2Phone" handleChange={handleChange} />
                    <Select
                      name="parent2OwnAddress"
                      values={values}
                      handleChange={handleChange}
                      title="Adresse differente de celle du volontaire"
                      options={[
                        { value: "true", label: "Oui" },
                        { value: "false", label: "Non" },
                      ]}
                    />
                    <Item disabled={values.parent2OwnAddress !== "true"} title="Adresse" values={values} name="parent2Address" handleChange={handleChange} />
                    <Item disabled={values.parent2OwnAddress !== "true"} title="Ville" values={values} name="parent2City" handleChange={handleChange} />
                    <Item disabled={values.parent2OwnAddress !== "true"} title="Code Postal" values={values} name="parent2Zip" handleChange={handleChange} />
                    <Select
                      disabled={values.parent2OwnAddress !== "true"}
                      name="parent2Department"
                      values={values}
                      handleChange={handleChange}
                      title="Département"
                      options={departmentList.map((d) => ({ value: d, label: d }))}
                    />
                    <Select
                      disabled={values.parent2OwnAddress !== "true"}
                      name="parent2Region"
                      values={values}
                      handleChange={handleChange}
                      title="Région"
                      options={regionList.map((r) => ({ value: r, label: r }))}
                    />
                  </BoxContent>
                </Box>
              </Col>
            </Row>
            <Row>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxTitle>Consentement des représentants légaux</BoxTitle>
                  <BoxContent direction="column">
                    <Select
                      disabled={!values.parentConsentmentFiles.length}
                      name="parentConsentmentFilesCompliant"
                      values={values}
                      handleChange={handleChange}
                      title="Consentement"
                      options={[
                        { value: "true", label: "Conforme" },
                        { value: "false", label: "Non conforme" },
                      ]}
                    />
                    {values.parentConsentmentFilesCompliant === "false" ? (
                      <>
                        <Checkbox
                          name="parentConsentmentFilesCompliantInfo"
                          value="signature"
                          values={values}
                          handleChange={handleChange}
                          description="Manque de la signature d'un des représentants"
                        />
                        <Checkbox
                          name="parentConsentmentFilesCompliantInfo"
                          value="proof"
                          values={values}
                          handleChange={handleChange}
                          description="Manque d'un justificatif d'autorité parentale non partagée"
                        />
                        <Checkbox name="parentConsentmentFilesCompliantInfo" value="other" values={values} handleChange={handleChange} description="Autre" />
                      </>
                    ) : null}
                    <Documents>
                      <h4>Attestations des représentants légaux</h4>
                      <DndFileInput
                        placeholder="un document justificatif"
                        errorMessage="Vous devez téléverser un document justificatif"
                        value={values.parentConsentmentFiles}
                        source={(e) => api.get(`/referent/youngFile/${values._id}/parentConsentmentFiles/${e}`)}
                        name="cniFiles"
                        onChange={async (e) => {
                          const res = await api.uploadFile("/referent/file/parentConsentmentFiles", e.target.files, { youngId: values._id });
                          if (res.code === "FILE_CORRUPTED") {
                            return toastr.error(
                              "Le fichier semble corrompu",
                              "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                              { timeOut: 0 }
                            );
                          }
                          if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                          // We update and save it instant.
                          handleChange({ target: { value: res.data, name: "parentConsentmentFiles" } });
                          handleSubmit();
                        }}
                      />
                    </Documents>
                  </BoxContent>
                </Box>
              </Col>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxTitle>Consentement de droit à l'image</BoxTitle>
                  <BoxContent direction="column">
                    <Select
                      name="imageRight"
                      values={values}
                      handleChange={handleChange}
                      title="Autorisation"
                      options={[
                        { value: "true", label: "Oui" },
                        { value: "false", label: "Non" },
                      ]}
                    />
                    <Documents>
                      <h4>Formulaire de consentement de droit à l'image</h4>
                      <DndFileInput
                        placeholder="un document justificatif"
                        errorMessage="Vous devez téléverser un document justificatif"
                        value={values.imageRightFiles}
                        source={(e) => api.get(`/referent/youngFile/${values._id}/imageRightFiles/${e}`)}
                        name="cniFiles"
                        onChange={async (e) => {
                          const res = await api.uploadFile("/referent/file/imageRightFiles", e.target.files, { youngId: values._id });
                          if (res.code === "FILE_CORRUPTED") {
                            return toastr.error(
                              "Le fichier semble corrompu",
                              "Pouvez vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
                              { timeOut: 0 }
                            );
                          }
                          if (!res.ok) return toastr.error("Une erreur s'est produite lors du téléversement de votre fichier");
                          // We update and save it instant.
                          handleChange({ target: { value: res.data, name: "imageRightFiles" } });
                          handleSubmit();
                        }}
                      />
                    </Documents>
                  </BoxContent>
                </Box>
              </Col>
            </Row>
          </>
        )}
      </Formik>
    </Wrapper>
  );
};

const Item = ({ errors, touched, title, values, name, handleChange, type = "text", disabled = false, required = false }) => {
  const renderInput = () => {
    if (type === "date") {
      return (
        <>
          <Field hidden name="birthdateAt" value={values.birthdateAt} validate={(v) => required && !v && requiredMessage} />
          <DateInput
            value={values.birthdateAt}
            onChange={(date) => {
              handleChange({ target: { value: date, name: "birthdateAt" } });
            }}
          />
        </>
      );
    }
    return (
      <>
        <Field
          disabled={disabled}
          className="form-control"
          value={translate(values[name])}
          name={name}
          onChange={handleChange}
          type={type}
          validate={(v) => required && !v && requiredMessage}
        />
        {errors && touched && <Error errors={errors} touched={touched} name={name} />}
      </>
    );
  };
  return (
    <Row className="detail">
      <Col md={4}>
        <label>{title}</label>
      </Col>
      <Col md={8}>{renderInput()}</Col>
    </Row>
  );
};

const Select = ({ title, name, values, handleChange, disabled, errors, touched, validate, options }) => {
  return (
    <Row className="detail">
      <Col md={4}>
        <label>{title}</label>
      </Col>
      <Col md={8}>
        <select disabled={disabled} className="form-control" name={name} value={values[name]} onChange={handleChange}>
          <option key={-1} value="" label=""></option>
          {options.map((o, i) => (
            <option key={i} value={o.value} label={o.label}>
              {o.value}
            </option>
          ))}
        </select>
      </Col>
    </Row>
  );
};

const Checkbox = ({ title, name, value, values, handleChange, disabled, description }) => {
  return (
    <Row className="detail">
      <Col md={4}>
        <label>{title}</label>
      </Col>
      <Col md={8}>
        <RadioLabel>
          <Field disabled={disabled} className="form-control" type="radio" name={name} value={value} checked={values[name] === value} onChange={handleChange} />
          {description}
        </RadioLabel>
      </Col>
    </Row>
  );
};

const Documents = styled.div`
  margin-left: 1rem;
  margin-right: 1rem;
  margin-top: 3rem;
  h4 {
    font-size: 1rem;
    font-weight: 500;
    color: #6a6f85;
  }
  label {
    display: block !important;
    width: 100%;
  }
`;

const Wrapper = styled.div`
  padding: 20px 40px;
`;

// Title line with filters
const TitleWrapper = styled.div`
  margin: 32px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  button {
    background-color: #5245cc;
    border: none;
    border-radius: 5px;
    padding: 7px 30px;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    :hover {
      background: #372f78;
    }
  }
`;
const Title = styled.h2`
  color: #242526;
  font-weight: bold;
  font-size: 28px;
`;

const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  min-height: 400px;
  height: 100%;
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  margin-bottom: 33px;
  border-radius: 8px;
`;
const BoxTitle = styled.h3`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px;
  color: #171725;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #f2f1f1;
  min-height: 5rem;
`;
const BoxContent = styled.div`
  label {
    font-weight: 500;
    color: #6a6f85;
    display: flex;
    margin-bottom: 0;
  }

  .detail {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px 20px;
    font-size: 14px;
    text-align: left;
    &-title {
      min-width: 100px;
      width: 100px;
      margin-right: 5px;
    }
  }
  .quote {
    font-size: 18px;
    font-weight: 400;
    font-style: italic;
  }

  padding: 1rem;
  display: flex;
  flex-direction: ${(props) => props.direction};

  & > * {
    ${(props) =>
      props.direction === "column" &&
      `
    `}
  }
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  color: #374151;
  font-size: 14px;
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

const SaveBtn = styled(LoadingButton)`
  background-color: #5245cc;
  border: none;
  border-radius: 5px;
  padding: 7px 30px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  :hover {
    background: #372f78;
  }
  &.outlined {
    :hover {
      background: #fff;
    }
    background-color: transparent;
    border: solid 1px #5245cc;
    color: #5245cc;
    font-size: 13px;
    padding: 4px 20px;
  }
`;
