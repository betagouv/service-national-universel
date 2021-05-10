import React from "react";
import { Col, Row } from "reactstrap";
import { Field } from "formik";

import Error, { requiredMessage } from "../../../components/errorMessage";
import { translate } from "../../../utils";

export default ({ title, name, values, handleChange, disabled, options, required = false, errors, touched }) => {
  return (
    <Row className="detail">
      <Col md={4}>
        <label>{title}</label>
      </Col>
      <Col md={8}>
        <Field hidden value={values[name]} name={name} onChange={handleChange} validate={(v) => required && !v && requiredMessage} />
        <select disabled={disabled} className="form-control" name={name} value={values[name]} onChange={handleChange}>
          <option key={-1} value="" label=""></option>
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
};
