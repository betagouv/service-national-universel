import React, { useState } from "react";
import { Col, Row, Input } from "reactstrap";
import styled from "styled-components";
import { Formik } from "formik";
import { toastr } from "react-redux-toastr";

import api from "../../../services/api";
import { translate } from "../../../utils";
import LoadingButton from "../../../components/buttons/LoadingButton";

export default ({ structure, onSent }) => {
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
        initialValues={{ role: "responsible", structureId: structure._id, structureName: structure.name }}
        onSubmit={async (values, actions) => {
          try {
            if (!values.firstName || !values.lastName || !values.email) {
              toastr.error("Vous devez remplir tous les champs", "nom, prénom et e-mail");
              return;
            }
            const { ok, code } = await api.post(`/referent/signup_invite/${values.role}`, values);
            if (!ok) toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(code));
            setSent(`${values.firstName} ${values.lastName}`);
            onSent();
            return toastr.success("Invitation envoyée");
          } catch (e) {
            toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(e));
          }
          actions.setSubmitting(false);
        }}
      >
        {({ values, handleChange, handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Title>Assigner un/e autre responsable</Title>
              <Subtitle>Vous pouvez partager vos droits d'administration de votre compte de structure d'accueil SNU avec plusieurs personnes</Subtitle>
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
              <ButtonContainer>
                <LoadingButton type="submit" onClick={handleSubmit}>
                  Envoyer l'invitation
                </LoadingButton>
              </ButtonContainer>
            </form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

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
