import React from "react";
import { Col, Row } from "reactstrap";

export default ({ title, name, values, handleChange, disabled, errors, touched, validate, options }) => {
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
