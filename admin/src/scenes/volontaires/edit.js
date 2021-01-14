import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { Field, Formik } from "formik";
import { Modal } from "reactstrap";
import LoadingButton from "../../components/loadingButton";

import DateInput from "../../components/dateInput";
import { departmentList, regionList, YOUNG_STATUS, translate } from "../../utils";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";

export default (props) => {
  const [young, setYoung] = useState();
  const [currentFile, setCurrentFile] = useState(null);
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

  const getSubtitle = () => {
    const createdAt = new Date(young.createdAt);
    createdAt.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(createdAt - now);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return `Inscrit(e) il y a ${diffDays} jour(s) - ${createdAt.toLocaleDateString()}`;
  };

  return (
    //@todo fix the depart and region
    <Wrapper>
      <Image value={currentFile} onChange={() => setCurrentFile(null)} />
      <Formik
        initialValues={young}
        onSubmit={async (values) => {
          try {
            const { ok, code, data: young } = await api.put(`/referent/young/${values._id}`, values);
            if (!ok) toastr.error("Une erreur s'est produite :", code);
            toastr.success("Mis à jour!");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", e.code);
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
                        <InfoBtn
                          key={i}
                          color="white"
                          loading={buttonsLoading[`cniFiles${i}`]}
                          onClick={async () => {
                            setButtonsLoading({ ...buttonsLoading, [`cniFiles${i}`]: true });
                            const { data, ok } = await api.get(`/referent/youngFile/${values._id}/cniFiles/${e}`);
                            setButtonsLoading({ ...buttonsLoading, [`cniFiles${i}`]: false });
                            setCurrentFile(data);
                          }}
                        >{`Visualiser la pièce d’identité (${i + 1}/${values.cniFiles.length})`}</InfoBtn>
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
                  <BoxContent direction="column">
                    {young && young.historic && young.historic.length !== 0 && (
                      <div className="info">
                        {young.historic.map((historicItem, key) => (
                          <HistoricItem key={key} item={historicItem} />
                        ))}
                      </div>
                    )}
                  </BoxContent>
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
                        <InfoBtn
                          key={i}
                          color="white"
                          loading={buttonsLoading[`highSkilledActivityProofFiles${i}`]}
                          onClick={async () => {
                            setButtonsLoading({ ...buttonsLoading, [`highSkilledActivityProofFiles${i}`]: true });
                            const { data, ok } = await api.get(`/referent/youngFile/${values._id}/highSkilledActivityProofFiles/${e}`);
                            setButtonsLoading({ ...buttonsLoading, [`highSkilledActivityProofFiles${i}`]: false });
                            setCurrentFile(data);
                          }}
                        >{`Visualiser le justificatif d'engagement (${i + 1}/${values.highSkilledActivityProofFiles.length})`}</InfoBtn>
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
                    {values.parentConsentmentFiles.map((e, i) => {
                      return (
                        <InfoBtn
                          key={i}
                          color="white"
                          loading={buttonsLoading[`parentConsentmentFiles${i}`]}
                          onClick={async () => {
                            setButtonsLoading({ ...buttonsLoading, [`parentConsentmentFiles${i}`]: true });
                            const { data, ok } = await api.get(`/referent/youngFile/${values._id}/parentConsentmentFiles/${values.parentConsentmentFiles[0]}`);
                            setButtonsLoading({ ...buttonsLoading, [`parentConsentmentFiles${i}`]: false });
                            setCurrentFile(data);
                          }}
                        >
                          Visualiser le formulaire de consentement
                        </InfoBtn>
                      );
                    })}
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
                    {values.parentConsentmentFiles && values.parentConsentmentFiles.length ? (
                      <InfoBtn
                        onClick={async () => {
                          const { data, ok } = await api.get(`/referent/youngFile/${values._id}/parentConsentmentFiles/${values.parentConsentmentFiles[0]}`);
                          setCurrentFile(data);
                        }}
                      >
                        Visualiser le formulaire de consentement
                      </InfoBtn>
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
                        <InfoBtn
                          key={i}
                          color="white"
                          loading={buttonsLoading[`imageRightFiles${i}`]}
                          onClick={async () => {
                            setButtonsLoading({ ...buttonsLoading, [`imageRightFiles${i}`]: true });
                            const { data, ok } = await api.get(`/referent/youngFile/${values._id}/imageRightFiles/${e}`);
                            setButtonsLoading({ ...buttonsLoading, [`imageRightFiles${i}`]: false });
                            setCurrentFile(data);
                          }}
                        >{`Visualiser le formulaire de consentement de droit à l'image (${i + 1}/${values.imageRightFiles.length})`}</InfoBtn>
                      );
                    })}
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

const HistoricItem = ({ item }) => {
  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString();
  };

  let color = "#6CC763";
  if (item.status === YOUNG_STATUS.WAITING_CORRECTION) color = "#FEB951";
  if (item.status === YOUNG_STATUS.WAITING_VALIDATION) color = "#FE7B52";
  if (item.status === YOUNG_STATUS.REFUSED) color = "#F8A9AD";
  if (item.status === YOUNG_STATUS.IN_PROGRESS) color = "#382F79";

  return (
    <>
      <Badge color={color}>{translate(item.status)}</Badge>
      <div className="history-detail">
        {item.note ? <div>{item.note}</div> : null}
        <div className="muted">
          Par <b>{item.userName}</b> • le {formatDate(item.createdAt)}
        </div>
      </div>
    </>
  );
};

const Item = ({ title, values, name, handleChange, type = "text", disabled = false }) => {
  const renderInput = () => {
    if (type === "date") {
      return (
        <>
          <Field
            hidden
            name="birthdateAt"
            value={values.birthdateAt}
          />
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

const Image = ({ value, onChange }) => {
  if (!value) return <div />;
  const arrayBufferView = new Uint8Array(value.data);
  const blob = new Blob([arrayBufferView], { type: "image/png" });
  const urlCreator = window.URL || window.webkitURL;
  const imageUrl = urlCreator.createObjectURL(blob);
  return (
    <Modal size="lg" isOpen={true} toggle={onChange}>
      <img style={{ objectFit: "contain", height: "90vh" }} src={imageUrl} />
    </Modal>
  );
};

const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 1rem;
  margin: 0 0.25rem;
  border-radius: 99999px;
  font-size: 0.8rem;
  margin-bottom: 5px;
  margin-top: 15px;
  ${({ color }) => `
    color: ${color};
    background-color: ${color}33;
  `}
`;

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

  .muted {
    color: #666;
  }
  .history-detail {
    font-size: 0.8rem;
    margin-top: 5px;
    margin-left: 10px;
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
