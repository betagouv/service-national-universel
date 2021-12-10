import React from "react";
import { useSelector } from "react-redux";
import { Col } from "reactstrap";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import { Formik, Field } from "formik";
import { NavLink, useHistory } from "react-router-dom";

import api from "../../../services/api";
import { HeroContainer } from "../../../components/Content";
import ErrorMessage, { requiredMessage } from "../../inscription/components/errorMessage";
import { SelectTag, step1, step2Technical, step2Question } from "./worflow";
import { translate } from "../../../utils";

export default function TicketCreate() {
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);
  const tags = [`COHORTE_${young.cohort}`, `DEPARTEMENT_${young.department}`, `REGION_${young.region}`, `EMETTEUR_Volontaire`, `CANAL_Plateforme`, `AGENT_Startup_Support`];

  return (
    <Container>
      <BackButton to={`/besoin-d-aide`}>{"<"} Retour à l&apos;accueil</BackButton>
      <Heading>
        <h4>Contacter quelqu&apos;un</h4>
        <p>Vous avez un problème technique, vous souhaitez en savoir plus sur votre situation, ou souhaitez contacter l&apos;un de vos référents ?</p>
      </Heading>
      <Form>
        <Formik
          initialValues={{ step1: null, step2: null, message: "" }}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (values) => {
            try {
              const { message, step1, step2 } = values;
              const { ok, code } = await api.post("/support-center/ticket", {
                title: `${step1?.label} - ${step2?.label}`,
                message,
                // eslint-disable-next-line no-unsafe-optional-chaining
                tags: [...new Set([...tags, ...(step1?.tags || []), ...(step2?.tags || [])])], // we use this dirty hack to remove duplicates
              });
              if (!ok) return toastr.error("Une erreur s'est produite lors de la création de ce ticket :", translate(code));
              toastr.success("Ticket créé");
              history.push("/besoin-d-aide");
            } catch (e) {
              console.log(e);
              toastr.error("Oups, une erreur est survenue", translate(e.code));
            }
          }}>
          {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
            <>
              <SelectTag
                name="step1"
                options={Object.values(step1)}
                title={"Ma demande"}
                selectPlaceholder={"Choisir la catégorie"}
                handleChange={handleChange}
                value={values?.step1?.id}
              />
              {values.step1?.id === "TECHNICAL" ? (
                <SelectTag
                  name="step2"
                  options={Object.values(step2Technical)}
                  title={"Sujet"}
                  selectPlaceholder={"Choisir le sujet"}
                  handleChange={handleChange}
                  value={values.step2?.id}
                />
              ) : null}
              {values.step1?.id === "QUESTION" ? (
                <SelectTag
                  name="step2"
                  options={Object.values(step2Question)}
                  title={"Sujet"}
                  selectPlaceholder={"Choisir le sujet"}
                  handleChange={handleChange}
                  value={values.step2?.id}
                />
              ) : null}
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
              <ContinueButton type="submit" style={{ marginLeft: 10 }} onClick={handleSubmit} disabled={isSubmitting}>
                Envoyer
              </ContinueButton>
            </>
          )}
        </Formik>
      </Form>
    </Container>
  );
}

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

const BackButton = styled(NavLink)`
  color: #666;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;

const Container = styled(HeroContainer)`
  display: flex;
  margin-top: -1rem;
  flex-direction: column;
`;

const Heading = styled.header`
  font-size: 3rem;
  display: flex;
  padding: 2rem;
  flex-direction: column;
  margin: 0 auto;
  width: clamp(700px, 80%, 1000px);
  @media (max-width: 767px) {
    width: 100%;
  }

  p {
    font-size: 1rem;
    color: #6b7280;
  }
  @media (max-width: 767px) {
    padding: 1.2rem;
    p {
      font-size: 1rem;
      color: #6b7280;
    }
  }
`;

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
  @media (max-width: 767px) {
    width: 100%;
  }
`;
