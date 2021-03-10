import React from "react";
import { Col, Row, Input } from "reactstrap";
import styled from "styled-components";
import { Formik } from "formik";
import { toastr } from "react-redux-toastr";

import api from "../../../services/api";
import { translate } from "../../../utils";

export default ({ structure }) => {
  return (
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
                <Button className="btn-blue" type="submit" onClick={handleSubmit}>
                  Envoyer l'invitation
                </Button>
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

const Button = styled.button`
  align-self: flex-start;
  border-radius: 4px;
  padding: 10px 15px;
  font-size: 1rem;
  font-weight: 400;
  cursor: pointer;
  background-color: #fff;
  &.btn-blue {
    color: #646b7d;
    border: 1px solid #dcdfe6;
    :hover {
      color: rgb(49, 130, 206);
      border-color: rgb(193, 218, 240);
      background-color: rgb(234, 243, 250);
    }
  }
  &.btn-red {
    border: 1px solid #f6cccf;
    color: rgb(206, 90, 90);
    :hover {
      border-color: rgb(240, 218, 218);
      background-color: rgb(250, 230, 230);
    }
  }
`;
