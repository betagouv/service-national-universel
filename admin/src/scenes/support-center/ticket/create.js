import React, { useState, useEffect } from "react";
import { Col } from "reactstrap";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import { Formik, Field } from "formik";
import { NavLink, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { translate, ROLES } from "../../../utils";

import { SelectTag, typesReferent, subjectsReferent, typesAdmin, subjectsAdmin, typesStructure, subjectsStructure } from "./workflow";
import LoadingButton from "../../../components/buttons/LoadingButton";
import api from "../../../services/api";
import ErrorMessage, { requiredMessage } from "../../../components/errorMessage";

export default function Create() {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);

  const [typesList, setTypeList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  useEffect(() => {
    if (!user) return;
    if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role)) {
      setTypeList(typesReferent);
      setSubjectsList(subjectsReferent);
    } else if ([ROLES.ADMIN].includes(user.role)) {
      setTypeList(typesAdmin);
      setSubjectsList(subjectsAdmin);
    } else if ([ROLES.SUPERVISOR, ROLES.RESPONSIBLE].includes(user.role)) {
      setTypeList(typesStructure);
      setSubjectsList(subjectsStructure);
    }
  }, [user]);

  // set the default tags for the user
  const tags = [`CANAL_Plateforme`, `AGENT_Startup_Support`];
  if (user.department) tags.push(`DEPARTEMENT_${user.department}`);
  if (user.region) tags.push(`REGION_${user.region}`);
  if ([ROLES.ADMIN].includes(user.role)) tags.push("EMETTEUR_Admin");
  if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role)) tags.push("EMETTEUR_Référent");
  if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role)) tags.push("EMETTEUR_Structure");

  return (
    <Container>
      <BackButton to={`/besoin-d-aide`}>{"<"} Retour à l&apos;accueil</BackButton>
      <Heading>
        <h4>Contacter quelqu&apos;un</h4>
        <p>Vous rencontrez une difficulté, avez besoin d&apos;assistance pour réaliser une action ou avez besoin d&apos;informations supplémentaires sur la plateforme ?</p>
      </Heading>
      <Form>
        <Formik
          initialValues={{ type: null, subject: null, message: "" }}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (values) => {
            try {
              const { subject, type, message } = values;

              // add the default tags
              const computedTags = [...tags];
              // add the type tag
              if (type?.tags) computedTags.push(...type.tags);
              // if needed, add the subject tag (we do not add the subject tag if the type is "Autre")
              if (subject?.tags && type?.id !== "OTHER") computedTags.push(...subject.tags);

              let title = type?.label;
              if (subject?.label && type?.id !== "OTHER") title += ` - ${subject?.label}`;
              const { ok, code } = await api.post("/support-center/ticket", {
                title,
                message,
                tags: [...new Set([...computedTags])], // dirty hack to remove duplicates
              });
              if (!ok) return toastr.error("Une erreur s'est produite lors de la création de ce ticket :", translate(code));
              toastr.success("Demande envoyée");
              history.push("/besoin-d-aide");
            } catch (e) {
              console.log(e);
              toastr.error("Oups, une erreur est survenue", translate(e.code));
            }
          }}>
          {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
            <>
              <SelectTag
                name="type"
                options={Object.values(typesList)}
                title={"Ma demande"}
                selectPlaceholder={"Choisir la catégorie"}
                handleChange={handleChange}
                value={values?.type?.id}
                errors={errors}
                touched={touched}
              />
              {values.type?.id === typesReferent.SPECIAL_CASE.id ? (
                <p className="refNote">
                  Pour vous aider à résoudre ce cas particulier, merci de nous transmettre toutes les informations nécessaires à la compréhension de cette situation. Si vous
                  souhaitez joindre des pièces envoyez votre demande à <a href="mailto:contact@snu.gouv.fr">contact@snu.gouv.fr</a>
                </p>
              ) : null}
              {values.type?.id && values.type?.id !== "OTHER" ? (
                <SelectTag
                  name="subject"
                  options={Object.values(subjectsList).filter((e) => e.parentId === values?.type?.id)}
                  title={"Sujet"}
                  selectPlaceholder={"Choisir le sujet"}
                  handleChange={handleChange}
                  value={values.subject?.id}
                  errors={errors}
                  touched={touched}
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
              <ContinueButton type="submit" style={{ marginLeft: 10 }} onClick={handleSubmit} disabled={isSubmitting} loading={isSubmitting}>
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
  .refNote {
    margin-top: 0.5rem;
    color: grey;
    text-align: center;
    max-width: 920px;
    a {
      color: #5145cd;
      text-decoration: underline;
    }
  }
  @media (max-width: 767px) {
    width: 100%;
  }
`;
