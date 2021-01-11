import React from "react";
import styled from "styled-components";
import { Row, Col, Input, Container } from "reactstrap";
import { Link } from "react-router-dom";

export default () => {
  return (
    <Wrapper>
      <Heading>
        <p>VALIDER MA PHASE 3</p>
        <h1>J'ai terminé ma mission de phase 3</h1>
      </Heading>
      <FormLegend>
        Ma mission
        <p>Renseignez ici votre justificatif de fin de mission</p>
      </FormLegend>
      <FormRow>
        <Col md={4}>
          <Label>Nom de la structure</Label>
        </Col>
        <Col>
          <Input />
        </Col>
      </FormRow>
      <FormRow align="center">
        <Col md={4}>
          <Label>Ma mission</Label>
        </Col>
        <Col>
          <Input type="textarea" style={{ maxWidth: 500, marginBottom: 10 }} rows={3} />
          <p style={{ color: "#6b7280", fontSize: 14, fontWeight: 400 }}>Décrivez en quelques mots votre mission</p>
        </Col>
      </FormRow>
      <FormRow>
        <Col md={4}>
          <Label>Ma convention</Label>
          <Modifybutton to="#">Télécharger un modèle</Modifybutton>
        </Col>
        <Col>
          <ImageInput>
            <input type="file" hidden />
            <img src={require("../../assets/image.svg")} />
            <strong style={{ color: "#5850ec" }}>Téléversez votre fichier</strong> ou déposez-déposez
            <span style={{ display: "block", fontWeight: 400, fontSize: 13 }}>PDF, PNG ou JPG jusqu'à 5 Mo</span>
          </ImageInput>
        </Col>
      </FormRow>
      <FormLegend>
        Mon tuteur
        <p>Coordonnées de votre tuteur</p>
      </FormLegend>
      <FormRow>
        <Col md={4}>
          <Label>Prénom</Label>
        </Col>
        <Col>
          <Input />
        </Col>
      </FormRow>
      <FormRow>
        <Col md={4}>
          <Label>Nom</Label>
        </Col>
        <Col>
          <Input />
        </Col>
      </FormRow>
      <FormRow>
        <Col md={4}>
          <Label>Email</Label>
        </Col>
        <Col>
          <Input />
        </Col>
      </FormRow>
      <FormRow>
        <Col md={4}>
          <Label>Téléphone</Label>
        </Col>
        <Col>
          <Input />
        </Col>
      </FormRow>

      <ContinueButton>Continuer</ContinueButton>
    </Wrapper>
  );
};

const Wrapper = styled(Container)`
  padding: 20px 40px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;
const Heading = styled.div`
  margin-bottom: 30px;
  h1 {
    color: #161e2e;
    font-size: 36px;
    font-weight: 700;
  }
  p {
    color: #42389d;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 5px;
  }
`;

const FormLegend = styled.div`
  color: #161e2e;
  font-size: 18px;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 0;
  p {
    color: #6b7280;
    margin-bottom: 0;
    font-size: 15px;
    font-weight: 400;
  }
`;

const FormRow = styled(Row)`
  border-bottom: 1px solid #e5e7eb;
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: ${({ align }) => align};
  text-align: left;
  input[type="text"] {
    max-width: 500px;
  }
`;

const Label = styled.div`
  color: #374151;
  margin-bottom: 10px;
`;

const ImageInput = styled.label`
  border: 1px dashed #d2d6dc;
  padding: 25px;
  text-align: center;
  display: block;
  outline: 0;
  border-radius: 6px;
  cursor: pointer;
  color: #4b5563;
  max-width: 500px;
  font-size: 14px;
  line-height: 1.7;
  cursor: pointer;

  img {
    height: 40px;
    display: block;
    margin: 10px auto;
  }
`;

const ContinueButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 400;
  font-size: 20px;
  margin: 40px 0 0 auto;
  display: block;
  width: 140px;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;

const Modifybutton = styled(Link)`
  border: 1px solid #d2d6dc;
  padding: 10px 15px;
  color: #3d4151;
  font-size: 12px;
  border-radius: 4px;
  margin-top: 5px;
  display: inline-block;
  :hover {
    color: #333;
  }
`;
