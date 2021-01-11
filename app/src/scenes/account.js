import React, { useEffect, useState } from "react";
import { Container, FormGroup, Input, Button, Row, Col, Modal, ModalHeader, ModalBody } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { Field, Formik, validateYupSchema } from "formik";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import api from "../services/api";
import LoadingButton from "../components/loadingButton";
import { setYoung } from "../redux/auth/actions";
import ErrorMessage, { requiredMessage } from "../scenes/inscription/components/errorMessage";
import { getPasswordErrorMessage } from "../utils";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();

  return (
    <Wrapper>
      <Heading>
        <span>{`${young.firstName} ${young.lastName}`}</span>
        <h1>Mes paramètres</h1>
      </Heading>
      <Formik
        initialValues={young}
        onSubmit={async (values) => {
          try {
            const { ok, code, data: young } = await api.put("/young", values);
            if (!ok) toastr.error("Une erreur s'est produite :", code);
            dispatch(setYoung(young));
            toastr.success("Mis à jour!");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", e.code);
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting }) => (
          <>
            <Title>Email</Title>
            <FormRow>
              <Item name="email" values={values} handleChange={handleChange} title="E-mail" disabled />
              {/* <ContinueButton style={{ marginLeft: 10 }} onClick={handleSubmit} disabled={isSubmitting}>
                Modifier
              </ContinueButton> */}
            </FormRow>
          </>
        )}
      </Formik>

      <Formik
        initialValues={young}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            const { ok, code, data: young } = await api.post("/young/reset_password", values);
            if (!ok) toastr.error("Une erreur s'est produite :", code);
            dispatch(setYoung(young));
            toastr.success("Mis à jour!");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la mise à jour du mot de passe :", e.code);
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
          <>
            <Title>Mot de passe</Title>
            <hr />

            <div style={{ marginLeft: -15 }}>
              <Item
                type="password"
                name="password"
                values={values}
                handleChange={handleChange}
                title="Actuel"
                validate={(v) => !v && requiredMessage}
                errors={errors}
                touched={touched}
              />
            </div>
            <div style={{ marginLeft: -15 }}>
              <Item
                type="password"
                name="newPassword"
                values={values}
                handleChange={handleChange}
                title="Nouveau"
                errors={errors}
                touched={touched}
                validate={getPasswordErrorMessage}
              />
            </div>
            <div style={{ marginLeft: -15 }}>
              <Item
                type="password"
                name="verifyPassword"
                values={values}
                handleChange={handleChange}
                title="Confirmer"
                validate={(v) => (!v && requiredMessage) || (v !== values.newPassword && "Les mots de passe renseignés ne sont pas identiques")}
                errors={errors}
                touched={touched}
              />
            </div>
            <ContinueButton onClick={handleSubmit} disabled={isSubmitting} style={{ width: "auto", margin: "40px 0" }}>
              Valider mon nouveau mot de passe
            </ContinueButton>
          </>
        )}
      </Formik>

      <Formik
        initialValues={young}
        onSubmit={async (values) => {
          try {
            const { ok, code, data: young } = await api.put("/young", values);
            if (!ok) toastr.error("Une erreur s'est produite :", code);
            dispatch(setYoung(young));
            toastr.success("Mis à jour!");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", e.code);
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting, submitForm }) => (
          <>
            <Title>Mon profil</Title>
            <FormRow>
              <Item name="firstName" values={values} handleChange={handleChange} title="Prénom" />
              <Item name="lastName" values={values} handleChange={handleChange} title="Nom" />
              <Select
                name="gender"
                values={values}
                handleChange={handleChange}
                title="Sexe"
                options={[
                  { value: "male", label: "Masculin" },
                  { value: "female", label: "Feminin" },
                ]}
              />
              <Item name="phone" values={values} handleChange={handleChange} title="Téléphone" />
            </FormRow>
            <Title>Représentant Légal</Title>
            <FormRow>
              <Select
                name="parent1Status"
                values={values}
                handleChange={handleChange}
                title="Statut du représentant légal 1"
                options={[
                  { value: "mother", label: "Mère" },
                  { value: "father", label: "Père" },
                  { value: "representant", label: "Représentant légal" },
                ]}
              />
              <Item name="parent1FirstName" values={values} handleChange={handleChange} title="Prénom" />
              <Item name="parent1LastName" values={values} handleChange={handleChange} title="Nom" />
              <Item name="parent1Email" values={values} handleChange={handleChange} title="E-mail" />
              <Item name="parent1Phone" values={values} handleChange={handleChange} title="Téléphone" />
            </FormRow>
            {values.parent2Status && (
              <FormRow>
                <Select
                  name="parent2Status"
                  values={values}
                  handleChange={handleChange}
                  title="Statut du représentant légal 2"
                  options={[
                    { value: "mother", label: "Mère" },
                    { value: "father", label: "Père" },
                    { value: "representant", label: "Représentant légal" },
                  ]}
                />
                <Item name="parent2FirstName" values={values} handleChange={handleChange} title="Prénom" />
                <Item name="parent2LastName" values={values} handleChange={handleChange} title="Nom" />
                <Item name="parent2Email" values={values} handleChange={handleChange} title="E-mail" />
                <Item name="parent2Phone" values={values} handleChange={handleChange} title="Téléphone" />
              </FormRow>
            )}
            <ContinueButton style={{ fontSize: 20, padding: "10px 20px" }} onClick={handleSubmit}>
              Enregistrer
            </ContinueButton>
          </>
        )}
      </Formik>
    </Wrapper>
  );
};

const Item = ({ title, name, values, handleChange, errors, touched, validate, type, ...props }) => {
  return (
    <Col md={4} style={{ marginTop: 20 }}>
      <Label>{title}</Label>
      <Field type={type} className="form-control" name={name} value={values[name]} onChange={handleChange} validate={validate} {...props} />
      {errors && <ErrorMessage errors={errors} touched={touched} name={name} />}
    </Col>
  );
};

const Select = ({ title, name, values, handleChange, errors, touched, validate, options }) => {
  return (
    <Col md={4} style={{ marginTop: 20 }}>
      <Label>{title}</Label>
      <select className="form-control" name={name} value={values[name]} onChange={handleChange} validate={validate}>
        {options.map((o) => (
          <option value={o.value} label={o.label} />
        ))}
      </select>
      {errors && <ErrorMessage errors={errors} touched={touched} name={name} />}
    </Col>
  );
};

const Wrapper = styled.div`
  padding: 20px 40px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;
const Heading = styled.div`
  margin-bottom: 30px;
  span {
    color: #42389d;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 5px;
  }
  h1 {
    color: #161e2e;
    margin-bottom: 0;
    font-size: 45px;
    font-weight: 800;
  }
`;

const Title = styled.h2`
  color: #161e2e;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 25px;
`;

const FormRow = styled(Row)`
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: ${({ align }) => align};
  text-align: left;
  input[type="text"] {
    max-width: 500px;
  }
  margin-bottom: 40px;
`;

const Label = styled.div`
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 5px;
`;

const ContinueButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 10px 40px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  display: block;
  width: 140px;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  align-self: flex-end;
  :hover {
    opacity: 0.9;
  }
`;
