import React from "react";
import { Col } from "reactstrap";
import { Field } from "formik";

import FormRow from "./FormRow";
import FormLabel from "./FormLabel";
import FormRadioLabel from "./FormRadioLabel";
import ErrorMessage, { requiredMessage } from "../../scenes/inscription/components/errorMessage";
import styled from "styled-components";

export default function FormRadioLabelTrueFalse({ title, children, name, values, handleChange, errors, touched }) {
  return (
    <FormRow>
      <Col md={4}>
        <FormLabel>
          {title} <p style={{ fontSize: "0.7rem" }}>{children}</p>
        </FormLabel>
      </Col>
      <Col md={8} style={{ display: "flex", alignItems: "center" }}>
        <FormRadioLabelStyled>
          <Field validate={(v) => !v && requiredMessage} type="radio" name={name} value="false" checked={values[name] === "false"} onChange={handleChange} />
          Non
        </FormRadioLabelStyled>
        <FormRadioLabelStyled>
          <Field validate={(v) => !v && requiredMessage} type="radio" name={name} value="true" checked={values[name] === "true"} onChange={handleChange} />
          Oui
        </FormRadioLabelStyled>
        <ErrorMessage errors={errors} touched={touched} name={name} />
      </Col>
    </FormRow>
  );
}

const FormRadioLabelStyled = styled(FormRadioLabel)`
  margin-right: 30px;
`;
