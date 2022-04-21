import React from "react";
import { Col, Row } from "reactstrap";
import { Field } from "formik";
import DateInput from "../../../components/dateInput";
import { translate } from "../../../utils";
import Error, { requiredMessage } from "../../../components/errorMessage";

export default function Item({ title, placeholder, values, name, handleChange, type = "text", disabled = false, required = false, errors, touched }) {
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
          {errors && touched && <Error errors={errors} touched={touched} name={name} />}
        </>
      );
    }
    return (
      <>
        <Field
          disabled={disabled}
          value={translate(values[name])}
          name={name}
          onChange={handleChange}
          type={type}
          validate={(v) => required && !v && requiredMessage}
          placeholder={placeholder || title}
        />
        {errors && touched && <Error errors={errors} touched={touched} name={name} />}
      </>
    );
  };
  return (
    <Row className="flex border flex-col justify-items-start m-1 rounded-lg rounded-grey-300 p-1">
      <div className="text-gray-500">
        <label>{title}</label>
      </div>
      {renderInput()}
    </Row>
  );
}
