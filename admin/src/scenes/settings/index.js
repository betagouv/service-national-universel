import React from "react";
import styled from "styled-components";

export default function Settings() {
  return (
    <Wrapper>
      <Title>Paramètres de compte</Title>
      <Legend>Votre adresse email</Legend>
      <FormGroup>
        <p style={{ color: "#a0aec1", fontSize: 12 }}>
          Sélectionner le tuteur qui va s&apos;occuper de la mission. Vous pouvez également ajouter un nouveau tuteur à votre équipe.
        </p>
        <label>
          <span>*</span>ADRESSE EMAIL
        </label>
        <input placeholder="Email" />
      </FormGroup>
      <Button>Modifier l&apos;email</Button>
      <Legend>Votre mot de passe</Legend>
      <p style={{ color: "#a0aec1", fontSize: 12 }}>Assurez vous de modifier votre mot de passe régulièrement pour améliorer la sécurité de votre compte.</p>
      <FormGroup>
        <label>
          <span>*</span>MOT DE PASSE ACTUEL
        </label>
        <input placeholder="Renseignez votre mot de passe actuel" />
      </FormGroup>
      <FormGroup>
        <label>
          <span>*</span>NOUVEAU MOT DE PASSE
        </label>
        <input placeholder="Choisissez votre nouveau mot de passe" />
      </FormGroup>
      <FormGroup>
        <label>
          <span>*</span>CONFIRMEZ VOTRE NOUVEAU MOT DE PASSE
        </label>
        <input placeholder="Confirmez votre nouveau mot de passe" />
      </FormGroup>

      <Button>Modifier le mot de passe</Button>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 40px;
  ${FormGroup} {
    max-width: 600px;
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

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
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
