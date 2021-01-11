import React, { useState } from "react";
import { Col, Row, Input } from "reactstrap";
import styled from "styled-components";
import { Formik, Field } from "formik";

import { useDispatch, useSelector } from "react-redux";

import AddressInput from "../../components/addressInput";
import { departmentList, regionList, translate, department2region } from "../../utils";
import api from "../../services/api";

export default () => {
  const { structure } = useSelector((state) => state.Auth);
  const [inputAddress, setInputAddress] = useState("");

  return (
    <Wrapper>
      <Subtitle>STRUCTURE</Subtitle>
      <Title>
        {structure.name}
        <Tag>{translate(structure.status)}</Tag>
      </Title>
      <Legend>Informations générales</Legend>
      <Formik
        initialValues={structure}
        onSubmit={async (values, actions) => {
          try {
            const { data, ok } = await api.put(`/structure`, values);
            if (ok && data) dispatch(setStructure(data));
            return toastr.success("Structure mise à jour");
          } catch (e) {
            console.log("e", e);
            toastr.error("Wrong login", e.code);
          }

          actions.setSubmitting(false);
        }}
      >
        {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit}>
              <LogoUpload>
                <div>
                  <div className="title">LOGO DE LA STRUCTURE</div>
                  <div className="logo">
                    <img src={require("../../assets/logo-placeholder.png")} />
                  </div>
                </div>
                <div style={{ marginLeft: 60, marginTop: 20 }}>
                  <UploadButton>
                    <input type="file" hidden />
                    Modifier
                  </UploadButton>
                  <p style={{ color: "#a0aec1", fontSize: 12 }}>Nous acceptons les fichiers au format PNG, JPG ou GIF, d'une taille maximale de 5 Mo</p>
                </div>
              </LogoUpload>
              <FormGroup>
                <label>
                  <span>*</span>NOM DE VOTRE STRUCTURE
                </label>
                <Input value={values.name} onChange={handleChange} name="name" placeholder="Nom de votre structure" />
              </FormGroup>
              <FormGroup>
                <label>
                  <span>*</span>STATUT JURIDIQUE
                </label>
                <Input type="select" name="statutJuridique" value={values.statutJuridique} onChange={handleChange}>
                  {["ASSOCIATION", "PUBLIC", "PRIVATE", "OTHER"].map((e) => (
                    <option key={e} value={e}>
                      {translate(e)}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup>
                <input placeholder="Choisissez le type de votre structure publique" />
              </FormGroup>
              <FormGroup>
                <input placeholder="Choisissez une option" />
              </FormGroup>
              <FormGroup>
                <label>PRÉSENTATION SYNTHÉTIQUE DE LA STRUCTURE</label>
                <textarea placeholder="Décrivez votre structure, en quelques mots" />
              </FormGroup>
              <FormGroup>
                <label>NUMÉRO SIRET</label>
                <p style={{ color: "#a0aec1", fontSize: 12 }}>Si vous ne disposez pas d’un numéro SIRET, ne pas remplir cette case</p>
                <textarea placeholder="Entrez votre numéro de SIRET" />
              </FormGroup>
              <Row>
                <Col>
                  <FormGroup>
                    <label>SITE INTERNET</label>
                    <input placeholder="http://" />
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup>
                    <label>FACEBOOK</label>
                    <input placeholder="http://" />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormGroup>
                    <label>TWITTER</label>
                    <input placeholder="http://" />
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup>
                    <label>INSTAGRAM</label>
                    <input placeholder="http://" />
                  </FormGroup>
                </Col>
              </Row>
              <Legend>Réseau national</Legend>
              <p style={{ color: "#a0aec1", fontSize: 12 }}>
                Si votre structure est membre d'un réseau national (La Croix Rouge, Armée du Salut...), renseignez son nom. Vous permettez ainsi au superviseur de votre réseau de
                visualiser les missions et volontaires rattachés à votre structure.
              </p>
              <FormGroup>
                <label>RÉSEAU NATIONAL</label>
                <input placeholder="Réseau national" />
              </FormGroup>
              <Legend>Lieu de l'établissement</Legend>
              <FormGroup>
                <label>
                  <span>*</span>LIEU
                </label>

                {/* TODO: add correct field name to match database model */}
                <AddressInput
                  value={inputAddress}
                  onChange={setInputAddress}
                  placeholder="Commencez à tapez votre adresse"
                  onSelect={(suggestion) => {
                    values.city = suggestion.properties.city;
                    values.zip = suggestion.properties.postcode;
                    values.address = suggestion.properties.label;
                    values.location = { lon: suggestion.geometry.coordinates[0], lat: suggestion.geometry.coordinates[1] };
                    const depart = suggestion.properties.postcode.substr(0, 2);
                    values.department = departmentList[depart];
                    values.region = regionList[department2region[depart]];
                    // values.department = `${depart} - ${departmentList[depart]}`;
                  }}
                />
                <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.city}</p>
              </FormGroup>
              <FormGroup>
                <label>
                  <span>*</span>DÉPARTEMENT
                </label>

                <Field
                  validate={(v) => validator.isEmpty(v) && "Ce champ est requis"}
                  disabled
                  name="department"
                  type="text"
                  value={values.department}
                  onChange={handleChange}
                  placeholder="Département"
                  hasError={errors.department}
                />
                <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.department}</p>
              </FormGroup>
              <FormGroup>
                <label>
                  <span>*</span>ADRESSE
                </label>
                <Field
                  validate={(v) => validator.isEmpty(v) && "Ce champ est requis"}
                  name="address"
                  disabled
                  type="text"
                  value={values.address}
                  onChange={handleChange}
                  placeholder="Adresse"
                  hasError={errors.address}
                />
                <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.address}</p>
              </FormGroup>
              <Row>
                <Col>
                  <FormGroup>
                    <label>
                      <span>*</span>CODE POSTAL
                    </label>
                    <Field
                      validate={(v) => validator.isEmpty(v) && "Ce champ est requis"}
                      disabled
                      name="zip"
                      type="text"
                      value={values.zip}
                      onChange={handleChange}
                      placeholder="Code postal"
                      hasError={errors.zip}
                    />
                    <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.zip}</p>
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup>
                    <label>
                      <span>*</span>VILLE
                    </label>
                    <Field
                      validate={(v) => validator.isEmpty(v) && "Ce champ est requis"}
                      name="city"
                      disabled
                      type="text"
                      value={values.city}
                      onChange={handleChange}
                      placeholder="Ville"
                      hasError={errors.city}
                    />
                    <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.city}</p>
                  </FormGroup>
                </Col>
              </Row>
              <Button type="submit">Enregistrer</Button>
            </form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 40px;
  ${FormGroup} {
    max-width: 750px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
  label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    color: #6a6f85;
    display: block;
    margin-bottom: 10px;
    span {
      color: red;
      font-size: 10px;
      margin-right: 5px;
    }
  }
  textarea,
  input {
    display: block;
    width: 100%;
    color: #606266;
    border: 0;
    outline: 0;
    padding: 11px 20px;
    border-radius: 6px;
    margin-right: 15px;
    border: 1px solid #dcdfe6;
    ::placeholder {
      color: #d6d6e1;
    }
    :focus {
      border: 1px solid #aaa;
    }
  }
`;

const Subtitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 400;
  text-transform: uppercase;
  font-size: 18px;
`;
const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
`;

const Legend = styled.div`
  color: rgb(38, 42, 62);
  margin-top: 30px;
  margin-bottom: 20px;
  font-size: 20px;
`;

const Button = styled.button`
  background-color: #3182ce;
  outline: 0;
  border: 0;
  color: #fff;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  :hover {
    background-color: #5a9bd8;
  }
`;

const LogoUpload = styled.div`
  display: flex;
  margin-bottom: 30px;
  .title {
    text-transform: uppercase;
    color: #6a6f85;
    font-size: 11px;
    margin-bottom: 5px;
    font-weight: 500;
  }
`;

const UploadButton = styled.label`
  background-color: #fff;
  border: 1px solid #dcdfe6;
  outline: 0;
  align-self: flex-start;
  border-radius: 4px;
  padding: 8px 20px;
  font-size: 14px;
  color: #646b7d;
  cursor: pointer;
  :hover {
    color: rgb(49, 130, 206);
    border-color: rgb(193, 218, 240);
    background-color: rgb(234, 243, 250);
  }
`;

const Tag = styled.span`
  background-color: rgb(240, 249, 235);
  border: 1px solid rgb(225, 243, 216);
  color: rgb(103, 194, 58);
  align-self: flex-start;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  margin-left: 15px;
`;
