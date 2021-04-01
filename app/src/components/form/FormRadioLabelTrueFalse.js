import React from "react";
import { Col } from "reactstrap";
import { Field } from "formik";

import FormRow from "./FormRow";
import FormLabel from "./FormLabel";
import FormRadioLabel from "./FormRadioLabel";
import ErrorMessage, { requiredMessage } from "../../scenes/inscription/components/errorMessage";

export default ({ title, children, name, values, handleChange, errors, touched }) => (
  <FormRow>
    <Col md={4}>
      <FormLabel>
        {title}
        {children}
      </FormLabel>
    </Col>
    <Col>
      <FormRadioLabel>
        <Field validate={(v) => !v && requiredMessage} type="radio" name={name} value="false" checked={values[name] === "false"} onChange={handleChange} />
        Non
      </FormRadioLabel>
      <FormRadioLabel>
        <Field validate={(v) => !v && requiredMessage} type="radio" name={name} value="true" checked={values[name] === "true"} onChange={handleChange} />
        Oui
      </FormRadioLabel>
      <ErrorMessage errors={errors} touched={touched} name={name} />
    </Col>
  </FormRow>
);
