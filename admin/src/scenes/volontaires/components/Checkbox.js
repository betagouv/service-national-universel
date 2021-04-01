import React from "react";
import { Col, Row } from "reactstrap";
import { Field } from "formik";
import styled from "styled-components";

export default ({ title, name, value, values, handleChange, disabled, description }) => {
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
