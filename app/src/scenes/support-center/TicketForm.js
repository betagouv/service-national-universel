import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { Col } from "reactstrap";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";

import api from "../../services/api";
import { HeroContainer } from "../../components/Content";
import { Formik, Field } from "formik";
import ErrorMessage, { requiredMessage } from "../../scenes/inscription/components/errorMessage";

// This component still contains test content
export default () => {
  const young = useSelector((state) => state.Auth.young);
  const options = ["Assistance technique", "À propos de ma situation", "Contacter un référent"]
  const [scope, useScope] = useState(options[0]);
  const [subject, useSubject] = useState("");
  const [message, useMessage] = useState("");
  const createTicket = async () => {
    try {
      await api.post("/support-center/ticket", {
        "title": subject,
        "group": scope,
        "customer": young.email,
        "article": {
          "subject": scope,
          "body": message,
          "type": "note",
        },
      },
        young,
      );
      toastr.success("Ticket créé");
    } catch (e) {
      console.log(e);
      toastr.error("Une erreur est survenue");
    }
  }

  return (
    <Container>
      <Heading>
        <h2>Contacter le support</h2>
        <p>Vous avez un problème technique, vous souhaitez en savoir plus sur votre situation, ou souhaitez contacter l'un de vos référents ?</p>
      </Heading>
      <Form>
        <Formik
          initialValues={young}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (values) => {
            try {
              const { ok, code, data: young } = await api.put("/young", values);
              if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
              dispatch(setYoung(young));
              toastr.success("Mis à jour!");
            } catch (e) {
              console.log(e);
              toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
            }
          }}
        >
          {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
            <>
              <Item
                name="scope"
                title="Ma demande"
                type="select"
                value={scope}
                handleChange={(e) => {
                  console.log('SCOPE', e.target.value);
                  useScope(e.target.value);
                }}
                validate={(v) => (!v && requiredMessage) || (!validator.isEmail(v) && "Ce champ est au mauvais format")}
                errors={errors}
                touched={touched}
                options={options}
              />
              <Item
                name="subject"
                title="Sujet"
                type="input"
                value={subject}
                handleChange={(e) => {
                  console.log('SUBJECT', e.target.value);
                  useSubject(e.target.value);
                }}
                validate={(v) => (!v && requiredMessage) || (!validator.isEmail(v) && "Ce champ est au mauvais format")}
                errors={errors}
                touched={touched}
                options={options}
              />
              <Item
                name="message"
                title="Mon message"
                type="textarea"
                value={message}
                handleChange={(e) => {
                  console.log('MESSAGE', e.target.value);
                  useMessage(e.target.value);
                }}
                validate={(v) => (!v && requiredMessage) || (!validator.isEmail(v) && "Ce champ est au mauvais format")}
                errors={errors}
                touched={touched}
                options={options}
              />
              <ContinueButton style={{ marginLeft: 10 }} onClick={createTicket} disabled={isSubmitting}>
                Envoyer
              </ContinueButton>
            </>
          )}
        </Formik>
      </Form>
    </Container>
  )
};

const Item = ({ title, name, value, handleChange, errors, touched, validate, type, options, ...props }) => {
  return (
    <Col style={{ marginTop: 20 }}>
      <Label>{title}</Label>
      {type === "select" ? (
        <Field as={type} className="form-control" name={name} value={value} onChange={handleChange} validate={validate} {...props}>
          {options?.map((option) => (
            <option value={option} key={option}>{option}</option>
          ))}
        </Field>
      ) : (
        <Field as={type} className="form-control" name={name} value={value} onChange={handleChange} validate={validate} {...props} />
      )}
      {errors && <ErrorMessage errors={errors} touched={touched} name={name} />}
    </Col>
  );
};

const Container = styled(HeroContainer)`
  display: flex;
  margin-top: -1rem;
`;

const Link = styled(NavLink)`
  color: #fff;
  cursor: pointer;
  :hover {
    color: #fff;
  }
`;

const Heading = styled.header`
  padding: 3rem;
  font-size: 3rem;
  flex: 1;
  p {
    font-size: 1.5rem;
    color: #6B7280;
  }
`;

const Label = styled.div`
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 5px;
`;

const Title = styled.h2`
  color: #161e2e;
  font-size: 2rem;
  @media (max-width: 767px) {
    font-size: 1.5rem;
  }
  font-weight: 700;
  margin-bottom: 25px;
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
  padding: 3rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  flex-direction: column;
  background-color: #fff;
`;
