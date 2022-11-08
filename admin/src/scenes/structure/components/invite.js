import { Field, Formik } from "formik";
import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { Col, Input, Row } from "reactstrap";
import styled from "styled-components";

import validator from "validator";
import LoadingButton from "../../../components/buttons/LoadingButton";
import api from "../../../services/api";
import { regexPhoneFrenchCountries, ROLES, SENDINBLUE_TEMPLATES, translate } from "../../../utils";

export default function Invite({ structure, onSent }) {
  const [sent, setSent] = useState();
  return sent ? (
    <Wrapper>
      <Title>{sent} a été invité dans votre structure.</Title>
      <ButtonContainer>
        <LoadingButton onClick={() => setSent(false)}>Inviter un(e) autre responsable</LoadingButton>
      </ButtonContainer>
    </Wrapper>
  ) : (
    <Wrapper>
      <Formik
        initialValues={{ role: ROLES.RESPONSIBLE, structureId: structure._id, structureName: structure.name }}
        onSubmit={async (values, actions) => {
          try {
            if (!values.firstName || !values.lastName || !values.email || !values.phone) {
              toastr.error("Vous devez remplir tous les champs", "nom, prénom et e-mail");
              return;
            }
            if (!validator.matches(values.phone, regexPhoneFrenchCountries)) {
              toastr.error("Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX");
              return;
            }
            if (structure.isNetwork === "true") values.role = ROLES.SUPERVISOR;
            const { ok, code } = await api.post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent.NEW_STRUCTURE_MEMBER}`, values);
            if (!ok) toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(code));
            setSent(`${values.firstName} ${values.lastName}`);
            onSent?.();
            return toastr.success("Invitation envoyée");
          } catch (e) {
            if (e.code === "USER_ALREADY_REGISTERED")
              return toastr.error("Cette adresse email est déjà utilisée.", `${values.email} a déjà un compte sur cette plateforme.`, { timeOut: 10000 });
            toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(e));
          }
          actions.setSubmitting(false);
        }}>
        {({ values, handleChange, handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Title>Assigner un/e autre responsable</Title>
              <Subtitle>Vous pouvez partager vos droits d&apos;administration de votre compte de structure d&apos;accueil SNU avec plusieurs personnes</Subtitle>
              <Row>
                <Col>
                  <FormGroup>
                    <label>
                      <span>*</span>PRÉNOM
                    </label>
                    <Input value={values.firstName} name="firstName" onChange={handleChange} placeholder="Prénom" />
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup>
                    <label>
                      <span>*</span>NOM
                    </label>
                    <Input value={values.lastName} name="lastName" onChange={handleChange} placeholder="Nom de famille" />
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup>
                <label>
                  <span>*</span>ADRESSE EMAIL
                </label>
                <Input type="email" value={values.email} name="email" onChange={handleChange} placeholder="Adresse Email" />
              </FormGroup>
              <FormGroup>
                <label>
                  <span>*</span>Téléphone
                </label>
                <Field
                  className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm  text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
                  name="phone"
                  type="tel"
                  id="phone"
                  value={values.phone}
                  onChange={handleChange}
                  placeholder="06/02 00 00 00 00"
                />
              </FormGroup>
              <ButtonContainer>
                <LoadingButton type="submit" onClick={handleSubmit}>
                  Envoyer l&apos;invitation
                </LoadingButton>
              </ButtonContainer>
            </form>
          );
        }}
      </Formik>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 40px;
  ${FormGroup} {
    max-width: 750px;
  }
`;

const FormGroup = styled.div`
  margin-top: 1.5rem;
  label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    color: #6a6f85;
    display: block;
    margin-bottom: 10px;
    span {
      color: red;
      font-size: 10px;
      margin-right: 5px;
    }
  }
  input {
    display: block;
    width: 100%;
    background-color: #fff;
    color: #606266;
    border: 0;
    outline: 0;
    padding: 11px 20px;
    border-radius: 6px;
    margin-right: 15px;
    border: 1px solid #dcdfe6;
    ::placeholder {
      color: #d6d6e1;
    }
    :focus {
      border: 1px solid #aaa;
    }
  }
`;
const Subtitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 400;
  font-size: 14px;
`;
const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 1rem;
`;
