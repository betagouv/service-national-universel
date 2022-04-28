import React from "react";
import { Col, Row } from "reactstrap";
import { Field } from "formik";

import Error, { requiredMessage } from "../../../components/errorMessage";

export default function Select({ title, name, values, handleChange, disabled, options, required = false, errors, touched, placeholder = "", tw }) {
  return (
    <Row className="detail">
      <Col md={4}>
        <label className={tw}>{title}</label>
      </Col>
      <Col md={8}>
        <Field hidden value={values[name]} name={name} onChange={handleChange} validate={(v) => required && !v && requiredMessage} />
        <select disabled={disabled} className="form-control" name={name} value={values[name]} onChange={handleChange} validate={(v) => required && !v && requiredMessage}>
          <option disabled key={-1} value="" selected={!values[name]} label={placeholder}>
            {placeholder}
          </option>
          {options.map((o, i) => (
            <option key={i} value={o.value} label={o.label}>
              {o.label}
            </option>
          ))}
        </select>
        {errors && touched && <Error errors={errors} touched={touched} name={name} />}
      </Col>
    </Row>
  );
}
