import React, { useState } from "react";
import { Col, Row, Input } from "reactstrap";
import styled from "styled-components";
import validator from "validator";
import { Formik, Field } from "formik";
import { toastr } from "react-redux-toastr";
import ImageInput from "../../components/ImageInput";

import { useDispatch, useSelector } from "react-redux";

import { translate } from "../../utils";
import api from "../../services/api";

const legalStatusTypes = ["ASSOCIATION", "PUBLIC", "PRIVATE", "OTHER"];
const CustomSelect = ({ field, form, children, ...props }) => (
  <Input type="select" {...field} {...props}>
    {children}
  </Input>
);

export default ({ onChange }) => {
  return (
    <Wrapper>
      <Title>Ma structure</Title>
      <Formik
        initialValues={{
          name: "",
          legalStatus: legalStatusTypes[0],
          description: "",
          siret: "",
          website: "",
          facebook: "",
          twitter: "",
          instagram: "",
          reseau_id: "",
        }}
        onSubmit={async (values, actions) => {
          return onChange("address");
        }}
      >
        {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit}>
              {/* <div>
                <label>LOGO DE LA STRUCTURE</label>
                <div>
                  <ImageInput
                    // onUpload={async (url) => {
                    //   await api.put(`/user?user_id=${user._id}`, { avatar: url });
                    //   toastr.success("success");
                    // }}
                    onError={(error) => toastr.error(Erreur !)}
                    // url={values.avatar}
                    // route={`/structure/image?user_id=${user._id}`}
                  />
                  <p style={{ color: "#606266", fontSize: 12 }}>Nous acceptons les fichiers au format PNG, JPG ou GIF, d'une taille maximale de 5 Mo</p>
                </div>
              </div> */}
              <FormGroup>
                <label>
                  <span>*</span>NOM DE VOTRE STRUCTURE
                </label>
                <Field
                  validate={(v) => validator.isEmpty(v) && "Ce champ est requis"}
                  name="name"
                  type="text"
                  value={values.name}
                  onChange={handleChange}
                  placeholder="Nom de votre structure"
                  hasError={errors.name}
                />
                <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.name}</p>
              </FormGroup>
              <FormGroup>
                <label>
                  <span>*</span>STATUT JURIDIQUE
                </label>
                <Field name="legalStatus" component={CustomSelect} value={values.legalStatus} onChange={handleChange} hasError={errors.legalStatus}>
                  {legalStatusTypes.map((e) => (
                    <option key={e} value={e}>
                      {translate(e)}
                    </option>
                  ))}
                </Field>
                <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.legalStatus}</p>
              </FormGroup>
              <FormGroup>
                <label>PRÉSENTATION SYNTHÉTIQUE DE LA STRUCTURE</label>
                <Field name="description" component="textarea" value={values.description} onChange={handleChange} placeholder="Décrivez votre structure, en quelques mots" />
              </FormGroup>
              <FormGroup>
                <label>NUMÉRO SIRET</label>
                <p style={{ color: "#a0aec1", fontSize: 12 }}>Si vous ne disposez pas d’un numéro SIRET, ne pas remplir cette case</p>
                <Field name="siret" type="text" value={values.siret} onChange={handleChange} placeholder="Entrez votre numéro de SIRET" hasError={errors.siret} />
              </FormGroup>
              <Row>
                <Col>
                  <FormGroup>
                    <label>SITE INTERNET</label>
                    <Field name="website" type="text" value={values.website} onChange={handleChange} placeholder="http://" hasError={errors.website} />
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup>
                    <label>FACEBOOK</label>
                    <Field name="facebook" type="text" value={values.facebook} onChange={handleChange} placeholder="http://" hasError={errors.facebook} />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormGroup>
                    <label>TWITTER</label>
                    <Field name="twitter" type="text" value={values.twitter} onChange={handleChange} placeholder="http://" hasError={errors.twitter} />
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup>
                    <label>INSTAGRAM</label>
                    <Field name="instagram" type="text" value={values.instagram} onChange={handleChange} placeholder="http://" hasError={errors.instagram} />
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
                <Field name="reseau_id" type="text" value={values.reseau_id} onChange={handleChange} placeholder="Réseau national" hasError={errors.reseau_id} />
              </FormGroup>
              <Button type="submit">Continuer</Button>
            </form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 50px;
  max-width: 520px;
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
    background-color: #fff;
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
