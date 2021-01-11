import React, { useState, useEffect } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { Formik, Field } from "formik";
import validator from "validator";
import AddressInput from "../../components/addressInput";
import { department2region, departmentList, regionList } from "../../utils";

import { useDispatch, useSelector } from "react-redux";

import { translate } from "../../utils";
import api from "../../services/api";

export default ({ onChange }) => {
  const [inputAddress, setInputAddress] = useState("");

  useEffect(() => {
    if (document.getElementsByTagName) {
      const inputElements = document.getElementsByTagName("input");
      for (let i = 0; inputElements[i]; i++) inputElements[i].setAttribute("autocomplete", "novalue");
    }
  }, []);

  return (
    <Wrapper>
      <Title>Lieu de l'établissement</Title>
      <Formik
        initialValues={{ department: "", address: "", zip: "", city: "" }}
        onSubmit={async (values, actions) => {
          // const result = { ...values, location: { lon, lat } };
          console.log(values);
          return onChange();
          // try {
          //   const { data, ok } = await api.put(`/structure`, values);
          //   if (ok && data) dispatch(setStructure(data));
          //   return toastr.success("Structure mise à jour");
          // } catch (e) {
          //   console.log("e", e);
          //   toastr.error("Wrong login", e.code);
          // }

          // actions.setSubmitting(false);
        }}
      >
        {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit}>
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
              {/* <Row>
                <Col>
                  <FormGroup>
                    <label>LATITUDE</label>
                    <Field name="lat" type="text" value={values.lat} onChange={handleChange} placeholder="Latitude" hasError={errors.lat} />
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup>
                    <label>LONGITUDE</label>
                    <Field name="lon" type="text" value={values.lon} onChange={handleChange} placeholder="Latitude" hasError={errors.lon} />
                  </FormGroup>
                </Col>
              </Row> */}
              <Button type="submit">Valider</Button>
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
