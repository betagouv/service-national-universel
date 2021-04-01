import React from "react";
import { Col, Row } from "reactstrap";
import { Field } from "formik";
import DateInput from "../../../components/dateInput";
import { translate } from "../../../utils";
import Error, { requiredMessage } from "../../../components/errorMessage";

export default ({ title, values, name, handleChange, type = "text", disabled = false, required = false, errors, touched }) => {
  const renderInput = () => {
    if (type === "date") {
      return (
        <>
          <Field hidden name="birthdateAt" value={values.birthdateAt} validate={(v) => required && !v && requiredMessage} />
          <DateInput
            value={values.birthdateAt}
            onChange={(date) => {
              handleChange({ target: { value: date, name: "birthdateAt" } });
            }}
          />
        </>
      );
    }
    return (
      <>
        <Field
          disabled={disabled}
          className="form-control"
          value={translate(values[name])}
          name={name}
          onChange={handleChange}
          type={type}
          validate={(v) => required && !v && requiredMessage}
        />
        {errors && touched && <Error errors={errors} touched={touched} name={name} />}
      </>
    );
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
