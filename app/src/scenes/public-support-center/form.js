import React, { useState } from "react";
import { Col } from "reactstrap";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import { Formik, Field } from "formik";
import close from "../../assets/cancel.png";

import api from "../../services/api";
import { translate } from "../../utils";
import LoadingButton from "../../components/buttons/LoadingButton";
import ErrorMessage, { requiredMessage } from "../inscription/components/errorMessage";

export default ({ setOpen, setSuccessMessage, young }) => {
  const tags = [`EMETTEUR_Exterieur`, `CANAL_Plateforme`, `AGENT_Startup_Support`];
  const [loading, setLoading] = useState(false);
  return (
    <Form>
      <img src={close} onClick={() => setOpen(false)} />
      <Formik
        initialValues={{ step1: null, step2: null, message: "", subject: "", email: "", name: "" }}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            setLoading(true);
            const { message, subject, name, email } = values;
            const { ok, code, data } = await api.post("/support-center/public/ticket", {
              title: `Formulaire de contact - ${name} - ${subject}`,
              subject,
              name,
              email,
              message,
              tags: [...new Set([...tags])], // we use this dirty hack to remove duplicates
            });
            setLoading(false);
            if (!ok) return toastr.error("Une erreur s'est produite lors de la création de ce ticket :", translate(code));
            toastr.success("Ticket créé");
            setSuccessMessage("Votre demande a bien été envoyée ! Nous vous répondrons par mail.");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue", translate(e.code));
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
          <>
            <Item
              name="name"
              title="Nom et prénom"
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
              type="input"
              value={values.email}
              handleChange={handleChange}
              validate={(v) => !v && requiredMessage}
              errors={errors}
              touched={touched}
              rows="2"
            />
            <Item
              name="subject"
              title="Le sujet de ma demande"
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
};

const Item = ({ title, name, value, handleChange, errors, touched, validate, type, options, ...props }) => {
  return (
    <Col style={{ marginTop: 20 }}>
      <Label>{title}</Label>
      {type === "select" ? (
        <Field as={type} className="form-control" name={name} value={value} onChange={handleChange} validate={validate} {...props}>
          <option value="" disabled>
            Catégorie
          </option>
          {options?.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </Field>
      ) : (
        <Field as={type} className="form-control" name={name} value={value} onChange={handleChange} validate={validate} {...props} />
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

const ContinueButton = styled.button`
  @media (max-width: 767px) {
    margin: 1rem 0;
  }
  color: #fff;
  background-color: #5145cd;
  padding: 10px 40px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  display: block;
  width: auto;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  align-self: flex-start;
  margin-top: 1rem;
  :hover {
    opacity: 0.9;
  }
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
