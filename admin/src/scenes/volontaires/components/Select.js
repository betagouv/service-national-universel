import React from "react";
import { Field } from "formik";

import Error, { requiredMessage } from "../../../components/errorMessage";

export default function Select({ title, name, values, handleChange, disabled, options, required = false, errors, touched, placeholder, ...props }) {
  return (
    <section className="" {...props}>
      <div className="flex items-center justify-center">
        <label className="mr-3 mb-0">{title}</label>
        <Field hidden value={values[name]} name={name} onChange={handleChange} validate={(v) => required && !v && requiredMessage} />
        <select disabled={disabled} className="form-control w-[200px]" name={name} value={values[name]} onChange={handleChange} validate={(v) => required && !v && requiredMessage}>
          <option disabled key={-1} value="" selected={!values[name]} label={placeholder}>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o.value} label={o.label}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {errors && touched && <Error errors={errors} touched={touched} name={name} />}
    </section>
  );
}
