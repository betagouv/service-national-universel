import React, { useState } from "react";
import { Col } from "reactstrap";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import { Formik, Field } from "formik";
import close from "../../assets/cancel.png";

import api from "../../services/api";
import { translate, departmentList, department2region } from "../../utils";
import LoadingButton from "../../components/buttons/LoadingButton";
import ErrorMessage, { requiredMessage } from "../../components/errorMessage";
import { SelectTag, step1, step2TechnicalPublic, step2QuestionPublic } from "../support-center/ticket/workflow";

export default function PublicSupportCenterForm({ setOpen, setSuccessMessage }) {
  const tags = [`EMETTEUR_Exterieur`, `CANAL_Formulaire`, `AGENT_Startup_Support`];
  const [loading, setLoading] = useState(false);
  return (
    <Form>
      <img src={close} onClick={() => setOpen(false)} />
      <Formik
        initialValues={{ step1: null, step2: null, message: "", subject: "", email: "", name: "", department: "", region: "" }}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            setLoading(true);
            const { message, subject, name, email, step1, step2, department } = values;
            const regionTags = [`DEPARTEMENT_${department}`, `REGION_${department2region[department]}`];
            const { ok, code } = await api.post("/support-center/public/ticket", {
              title: `${step1?.label} - ${step2?.label} - ${subject}`,
              subject,
              name,
              email,
              message,
              tags: [...new Set([...tags, ...(step1?.tags || []), ...(step2?.tags || []), ...(regionTags || [])])], // we use this dirty hack to remove duplicates
            });
            setLoading(false);
            setOpen(false);
            if (!ok) return toastr.error("Une erreur s'est produite lors de la création de ce ticket :", translate(code));
            toastr.success("Ticket créé");
            setSuccessMessage("Votre demande a bien été envoyée ! Nous vous répondrons par mail.");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue", translate(e.code));
          }
        }}>
        {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
          <>
            <Item
              name="name"
              title="Nom et prénom"
              placeholder="Renseignez votre nom et prénom"
              type="input"
              value={values.name}
              handleChange={handleChange}
              validate={(v) => !v && requiredMessage}
              errors={errors}
              touched={touched}
              rows="2"
            />
            <Item
              name="email"
              title="Email"
              placeholder="Renseignez votre email"
              type="input"
              value={values.email}
              handleChange={handleChange}
              validate={(v) => !v && requiredMessage}
              errors={errors}
              touched={touched}
              rows="2"
            />
            <Item
              name="department"
              type="select"
              placeholder="Sélectionnez votre département"
              values={values}
              value={values.department}
              handleChange={handleChange}
              title="Département"
              options={departmentList.map((d) => ({ value: d, label: d }))}
              errors={errors}
              touched={touched}
            />
            <SelectTag name="step1" options={Object.values(step1)} title={"Sujet"} selectPlaceholder={"Choisir le sujet"} handleChange={handleChange} value={values?.step1?.id} />
            {values.step1?.id === "TECHNICAL" ? (
              <SelectTag
                name="step2"
                options={Object.values(step2TechnicalPublic)}
                title={"Précision"}
                selectPlaceholder={"Préciser"}
                handleChange={handleChange}
                value={values.step2?.id}
              />
            ) : null}
            {values.step1?.id === "QUESTION" ? (
              <SelectTag
                name="step2"
                options={Object.values(step2QuestionPublic)}
                title={"Précision"}
                selectPlaceholder={"Préciser"}
                handleChange={handleChange}
                value={values.step2?.id}
              />
            ) : null}
            <Item
              name="subject"
              title="Ma demande"
              placeholder="Renseignez votre demande"
              type="input"
              value={values.subject}
              handleChange={handleChange}
              validate={(v) => !v && requiredMessage}
              errors={errors}
              touched={touched}
              rows="2"
            />
            <Item
              name="message"
              title="Mon message"
              placeholder="Votre message"
              type="textarea"
              value={values.message}
              handleChange={handleChange}
              validate={(v) => !v && requiredMessage}
              errors={errors}
              touched={touched}
              rows="5"
            />
            <LoadingButton loading={loading} type="submit" style={{ marginLeft: 15, maxWidth: "150px", marginTop: 15 }} onClick={handleSubmit} disabled={isSubmitting}>
              Envoyer
            </LoadingButton>
          </>
        )}
      </Formik>
    </Form>
  );
}

const Item = ({ title, name, value, values, handleChange, errors, touched, validate, type, options, placeholder, ...props }) => {
  return (
    <Col style={{ marginTop: 20 }}>
      <Label>{title}</Label>
      {type === "select" ? (
        <Field as={type} className="form-control" name={name} value={value} onChange={handleChange} validate={validate} {...props}>
          <option disabled key={-1} value="" selected={!values[name]} label={placeholder}>
            {placeholder}
          </option>
          {options.map((o, i) => (
            <option key={i} value={o.value} label={o.label}>
              {o.label}
            </option>
          ))}
        </Field>
      ) : (
        <Field as={type} className="form-control" name={name} value={value} onChange={handleChange} validate={validate} placeholder={placeholder} {...props} />
      )}
      {errors && <ErrorMessage errors={errors} touched={touched} name={name} />}
    </Col>
  );
};

const Label = styled.div`
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 5px;
`;

const Form = styled.div`
  display: flex;
  flex: 2;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  flex-direction: column;
  background-color: #fff;
  margin: 0 auto;
  width: clamp(700px, 80%, 1000px);
  img {
    width: 1.5rem;
    align-self: flex-end;
    cursor: pointer;
  }
  @media (max-width: 767px) {
    width: 100%;
  }
`;
