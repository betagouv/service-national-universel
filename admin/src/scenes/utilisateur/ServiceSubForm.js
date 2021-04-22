import React from "react";
import { Form, Field } from "formik";
import * as Yup from "yup";
import { withSubForm } from "./withSubForm";
import { useValues } from "./useValues";

const nameSchema = Yup.object().shape({
  first: Yup.string().required("Required"),
  last: Yup.string().required("Required"),
});

const NameForm = ({ name, errors, touched, ...props }) => {
  useValues(name, props);

  return (
    <Form>
      <div>
        <label>
          First Name:
          <Field name="first" />
          {errors.first && touched.first ? <div>{errors.first}</div> : null}
        </label>
      </div>
      <div>
        <label>
          Last Name:
          <Field name="last" />
          {errors.last && touched.last ? <div>{errors.last}</div> : null}
        </label>
      </div>
    </Form>
  );
};

export const NameSubForm = withSubForm(NameForm, nameSchema);
