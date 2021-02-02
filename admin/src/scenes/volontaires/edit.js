import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { Field, Formik } from "formik";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { useSelector } from "react-redux";

import LoadingButton from "../../components/loadingButton";
import DownloadButton from "../../components/DownloadButton";
import Historic from "../../components/historic";
import DocumentInModal from "../../components/DocumentInModal";

import DateInput from "../../components/dateInput";
import { departmentList, regionList, YOUNG_STATUS, translate } from "../../utils";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

export default (props) => {
  const [young, setYoung] = useState();
  const [file, setFile] = useState(null);
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();
  const [buttonsLoading, setButtonsLoading] = useState({});

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return setYoung(null);
      const { data } = await api.get(`/referent/young/${id}`);
      setYoung(data);
    })();
  }, []);

  if (young === undefined) return <div>Chargement...</div>;

  const setButtonLoading = (btn, v) => {
    setButtonsLoading({ ...buttonsLoading, [btn]: v });
  };

  const getSubtitle = () => {
    const createdAt = new Date(young.createdAt);

    dayjs.extend(relativeTime).locale("fr");
    const diff = dayjs(createdAt).fromNow();
    return `Inscrit(e) ${diff} - ${createdAt.toLocaleDateString()}`;
  };

  return (
    //@todo fix the depart and region
    <Wrapper>
      {file && <DocumentInModal value={file} onChange={() => setFile(null)} />}
      <Formik
        initialValues={young}
        onSubmit={async (values) => {
          try {
            const { ok, code, data: young } = await api.put(`/referent/young/${values._id}`, values);
            if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
            toastr.success("Mis à jour!");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting, submitForm }) => (
          <>
            <TitleWrapper>
              <div>
                <Title>{`Profil de ${values.firstName} ${values.lastName}`}</Title>
                <SubTitle>{getSubtitle()}</SubTitle>
              </div>
              <button onClick={handleSubmit}>Enregistrer</button>
            </TitleWrapper>
            <Row>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxTitle>Identité</BoxTitle>
                  <BoxContent direction="column">
                    <Item title="Nom" values={values} name={"lastName"} handleChange={handleChange} />
                    <Item title="Prénom" values={values} name="firstName" handleChange={handleChange} />
                    <Item title="Date de naissance" type="date" values={values} name="birthdateAt" handleChange={handleChange} />
                    {values.cniFiles.map((e, i) => {
                      return (
                        <div key={i}>
                          <InfoBtn
                            color="white"
                            loading={buttonsLoading[`cniFiles${i}`]}
                            onClick={async () => {
                              setButtonLoading(`cniFiles${i}`, true);
                              const f = await api.get(`/referent/youngFile/${values._id}/cniFiles/${e}`);
                              setButtonLoading(`cniFiles${i}`, false);
                              setFile(f);
                            }}
                          >{`Visualiser la pièce d’identité (${i + 1}/${values.cniFiles.length})`}</InfoBtn>
                          <DownloadButtonWithMargin
                            source={() => api.get(`/referent/youngFile/${values._id}/cniFiles/${e}`)}
                            title={`Télécharger la pièce d’identité (${i + 1}/${values.cniFiles.length})`}
                          />
                        </div>
                      );
                    })}
                  </BoxContent>
                </Box>
              </Col>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <div>
                    <BoxTitle>{` Status : ${translate(young.status)}`}</BoxTitle>
                  </div>
                  <BoxContent direction="column">{young && young.historic && young.historic.length !== 0 && <Historic value={young.historic} />}</BoxContent>
                </Box>
              </Col>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxTitle>Coordonnées</BoxTitle>
                  <BoxContent direction="column">
                    <Item title="E-mail" values={values} name="email" handleChange={handleChange} />
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
                    {values.highSkilledActivityProofFiles.map((e, i) => {
                      return (
                        <div key={i}>
                          <InfoBtn
                            color="white"
                            loading={buttonsLoading[`highSkilledActivityProofFiles${i}`]}
                            onClick={async () => {
                              setButtonLoading(`highSkilledActivityProofFiles${i}`, true);
                              const f = await api.get(`/referent/youngFile/${values._id}/highSkilledActivityProofFiles/${e}`);
                              setButtonLoading(`highSkilledActivityProofFiles${i}`, false);
                              setFile(f);
                            }}
                          >{`Visualiser le justificatif d'engagement (${i + 1}/${values.highSkilledActivityProofFiles.length})`}</InfoBtn>
                          <DownloadButtonWithMargin
                            source={() => api.get(`/referent/youngFile/${values._id}/highSkilledActivityProofFiles/${e}`)}
                            title={`Télécharger le justificatif d'engagement (${i + 1}/${values.highSkilledActivityProofFiles.length})`}
                          />
                        </div>
                      );
                    })}
                  </BoxContent>
                </Box>
              </Col>
              <Col md={6} style={{ marginBottom: "20px" }}>
                <Box>
                  <BoxTitle>Motivations</BoxTitle>
                  <BoxContent direction="column" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div className="quote">{values.motivations ? `« ${values.motivations} »` : "Non renseignées"}</div>
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
                    {values.parentConsentmentFiles.length ? (
                      <div>
                        <InfoBtn
                          color="white"
                          loading={buttonsLoading[`parentConsentmentFiles0`]}
                          onClick={async () => {
                            setButtonLoading(`parentConsentmentFiles0`, true);
                            const f = await api.get(`/referent/youngFile/${values._id}/parentConsentmentFiles/${values.parentConsentmentFiles[0]}`);
                            setButtonLoading(`parentConsentmentFiles0`, false);
                            setFile(f);
                          }}
                        >
                          Visualiser le formulaire de consentement
                        </InfoBtn>
                        <DownloadButtonWithMargin
                          source={() => api.get(`/referent/youngFile/${values._id}/parentConsentmentFiles/${values.parentConsentmentFiles[0]}`)}
                          title={"Télécharger le formulaire de consentement"}
                        />
                      </div>
                    ) : null}
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
                    {values.parentConsentmentFiles && values.parentConsentmentFiles.length === 2 ? (
                      <div>
                        <InfoBtn
                          loading={buttonsLoading[`parentConsentmentFiles1`]}
                          onClick={async () => {
                            setButtonLoading(`parentConsentmentFiles1`, true);
                            const f = await api.get(`/referent/youngFile/${values._id}/parentConsentmentFiles/${values.parentConsentmentFiles[1]}`);
                            setButtonLoading(`parentConsentmentFiles1`, false);
                            setFile(f);
                          }}
                        >
                          Visualiser le formulaire de consentement
                        </InfoBtn>
                        <DownloadButtonWithMargin
                          source={() => api.get(`/referent/youngFile/${values._id}/parentConsentmentFiles/${values.parentConsentmentFiles[1]}`)}
                          title={"Télécharger le formulaire de consentement"}
                        />
                      </div>
                    ) : null}
                  </BoxContent>
                </Box>
              </Col>
            </Row>
            <Row>
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
                    {values.imageRightFiles.map((e, i) => {
                      return (
                        <div key={i}>
                          <InfoBtn
                            color="white"
                            onClick={async () => {
                              const f = await api.get(`/referent/youngFile/${values._id}/imageRightFiles/${e}`);
                              setFile(f);
                            }}
                          >{`Visualiser le formulaire de consentement de droit à l'image (${i + 1}/${values.imageRightFiles.length})`}</InfoBtn>
                          <DownloadButtonWithMargin
                            source={() => api.get(`/referent/youngFile/${values._id}/imageRightFiles/${e}`)}
                            title={`Télécharger le formulaire de consentement de droit à l'image (${i + 1}/${values.imageRightFiles.length})`}
                          />
                        </div>
                      );
                    })}
                  </BoxContent>
                </Box>
              </Col>
            </Row>
          </>
        )}
      </Formik>
      <DeleteBtn
        onClick={async () => {
          if (!confirm("Êtes-vous sûr(e) de vouloir supprimer ce profil")) return;
          try {
            const { ok, code } = await api.remove(`/young/${young._id}`);
            if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
            if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
            toastr.success("Ce profil a été supprimé.");
            return history.push(`/inscription`);
          } catch (e) {
            console.log(e);
            return toastr.error("Oups, une erreur est survenue pendant la supression du profil :", translate(e.code));
          }
        }}
      >
        Supprimer
      </DeleteBtn>
    </Wrapper>
  );
};

const Item = ({ title, values, name, handleChange, type = "text", disabled = false }) => {
  const renderInput = () => {
    if (type === "date") {
      return (
        <>
          <Field hidden name="birthdateAt" value={values.birthdateAt} />
          <DateInput
            value={values.birthdateAt}
            onChange={(date) => {
              handleChange({ target: { value: date, name: "birthdateAt" } });
            }}
          />
        </>
      );
    }
    return <Field disabled={disabled} className="form-control" value={translate(values[name])} name={name} onChange={handleChange} type={type} />;
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
        <select disabled={disabled} className="form-control" className="form-control" name={name} value={values[name]} onChange={handleChange}>
          <option key={-1} value="" label="" />
          {options.map((o, i) => (
            <option key={i} value={o.value} label={o.label} />
          ))}
        </select>
      </Col>
    </Row>
  );
};

const InfoBtn = styled(LoadingButton)`
  color: #555;
  background: url(${require("../../assets/eye.svg")}) left 15px center no-repeat;
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.16);
  border: 0;
  outline: 0;
  border-radius: 5px;
  padding: 8px 25px 8px 40px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  margin-left: 1rem;
  width: fit-content;
`;

const DownloadButtonWithMargin = styled(DownloadButton)`
  margin-left: 1rem;
`;

const DeleteBtn = styled.button`
  background-color: #bd2130;
  border: none;
  border-radius: 5px;
  padding: 7px 30px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  :hover {
    background: #dc3545;
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
const SubTitle = styled.h2`
  color: #242526;
  font-size: 1rem;
  font-weight: 300;
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
    display: block;
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
