import React, { useState } from "react";
import { Col, Row, Input } from "reactstrap";
import styled from "styled-components";
import { Formik } from "formik";
import { toastr } from "react-redux-toastr";
import { Redirect } from "react-router-dom";

import api from "../../services/api";

export default () => {
  const [redirect, setRedirect] = useState(false);

  if (redirect) return <Redirect to="/team" />;

  return (
    <Wrapper>
      <Formik
        initialValues={{ role: "tuteur" }}
        onSubmit={async (values, actions) => {
          try {
            const { ok } = await api.post("/referent", values);
            if (ok) {
              toastr.success("Nouveau membre ajouté");
              return setRedirect(true);
            }
          } catch (e) {
            console.log(e);
          }
          toastr.error("Erreur");
          actions.setSubmitting(false);
        }}
      >
        {({ values, handleChange, handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Subtitle>TEST SEB</Subtitle>
              <Title>Inviter un nouveau membre de votre équipe</Title>
              <Legend>Rôle de l'utilisateur</Legend>
              <RadioGroup>
                <input type="radio" checked={values.role === "tuteur"} onChange={(e) => handleChange({ target: { value: "tuteur", name: "role" } })} />
                <div>
                  <span>Tuteur</span>
                  <div>Vous pourrez ensuite assigner chaque tuteur à une ou plusieurs missions.</div>
                </div>
              </RadioGroup>
              <RadioGroup>
                <input type="radio" checked={values.role === "responsable"} onChange={(e) => handleChange({ target: { value: "responsable", name: "role" } })} />
                <div>
                  <span>Responsable</span>
                  <div>Vous pouvez partager vos droits d'administration de votre compte de structure d'accueil SNU avec plusieurs personnes.</div>
                </div>
              </RadioGroup>
              <br />
              <Legend>Informations générales</Legend>
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
              <Button type="submit" onClick={handleSubmit}>
                Ajouter un membre
              </Button>
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
  margin-bottom: 25px;
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

const RadioGroup = styled.label`
  display: flex;
  align-items: center;
  color: rgb(106, 111, 133);
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 15px;
  input[type="radio"] {
    height: 16px;
    width: 16px;
    margin-right: 10px;
    :checked + div span {
      color: #3182ce;
    }
  }
`;

const Subtitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 400;
  text-transform: uppercase;
  font-size: 18px;
`;
const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 10px;
`;

const Legend = styled.div`
  color: rgb(38, 42, 62);
  margin-top: 30px;
  margin-bottom: 20px;
  font-size: 20px;
`;

const Button = styled.button`
  background-color: #3182ce;
  outline: 0;
  border: 0;
  color: #fff;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  :hover {
    background-color: #5a9bd8;
  }
`;
