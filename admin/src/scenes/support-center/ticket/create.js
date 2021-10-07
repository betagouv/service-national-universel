import React, { useEffect } from "react";
import { Col } from "reactstrap";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import { Formik, Field } from "formik";
import { NavLink } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

import LoadingButton from "../../../components/buttons/LoadingButton";
import api from "../../../services/api";
import ErrorMessage, { requiredMessage } from "../../../components/errorMessage";
import { ROLES } from "../../../utils";

export default () => {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);

  //todo : fetch zammad categories (scopes)
  const options = ["Assistance technique", "Aide sur un cas particulier", "Autre"];
  const defaultTags = [`DEPARTEMENT_${user.department}`, `REGION_${user.region}`, `CANAL_Plateforme`, `AGENT_Startup_Support`];
  if ([ROLES.ADMIN].includes(user.role)) defaultTags.push("EMETTEUR_Admin");
  if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role)) defaultTags.push("EMETTEUR_Référent");
  if ([ROLES.RESPONSABLE, ROLES.SUPERVISOR].includes(user.role)) defaultTags.push("EMETTEUR_Structure");

  return (
    <Container>
      <BackButton to={`/besoin-d-aide`}>{"<"} Retour à l'accueil</BackButton>
      <Heading>
        <h4>Contacter quelqu'un</h4>
        <p>Vous rencontrez une difficulté, avez besoin d'assistance pour réaliser une action ou avez besoin d'informations supplémentaires sur la plateforme ?</p>
      </Heading>
      <Form>
        <Formik
          initialValues={{ type: "", subject: "", message: "", tags: defaultTags }}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (values) => {
            try {
              const { subject, type, message, tags } = values;
              if (type === "Assistance technique") {
                tags.push("AGENT_Startup_Technique");
              } else if (type === "Aide sur un cas particulier") {
                // tags.push("AGENT_Startup_Support");
              } else if (type === "Autre") {
                // tags.push("AGENT_Startup_Support");
              }
              const { ok, code, data } = await api.post("/support-center/ticket", {
                subject,
                type,
                message,
                tags,
              });
              if (!ok) return toastr.error("Une erreur s'est produite lors de la création de ce ticket :", translate(code));
              toastr.success("Ticket créé");
              history.push("/besoin-d-aide");
            } catch (e) {
              console.log(e);
              toastr.error("Oups, une erreur est survenue", translate(e.code));
            }
          }}
        >
          {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
            <>
              <Item
                name="type"
                title="Ma demande"
                type="select"
                value={values.type}
                handleChange={handleChange}
                validate={(v) => !v && requiredMessage}
                errors={errors}
                touched={touched}
                options={options}
              />
              <Item
                name="subject"
                title="Sujet"
                type="input"
                value={values.subject}
                handleChange={handleChange}
                validate={(v) => !v && requiredMessage}
                errors={errors}
                touched={touched}
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
              <ContinueButton type="submit" style={{ marginLeft: 10 }} onClick={handleSubmit} disabled={isSubmitting} loading={isSubmitting}>
                Envoyer
              </ContinueButton>
            </>
          )}
        </Formik>
      </Form>
    </Container>
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

export const HeroContainer = styled.div`
  flex: 1;
  padding: 1rem;
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

const BackButton = styled(NavLink)`
  color: #666;
  margin-top: 1rem;
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

const ContinueButton = styled(LoadingButton)`
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
