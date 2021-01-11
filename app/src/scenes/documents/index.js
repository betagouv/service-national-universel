import React from "react";
import { Link } from "react-router-dom";
import { Col, Container, CustomInput, Input, Row } from "reactstrap";
import styled from "styled-components";

export default () => {
  return (
    <Documents>
      <Heading>
        <p>MES DOCUMENTS</p>
        <h1>Documents à télécharger</h1>
        <ul>
          <li>
            <a href="https://cellar-c2.services.clever-cloud.com/moncompte/convention.pdf">
              Contrat d’engagement en mission d’intérêt général (MIG) du service national universel (SNU)
            </a>
          </li>
        </ul>
      </Heading>
    </Documents>
  );
};

const Documents = styled.div`
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  padding: 20px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
`;

const Heading = styled.div`
  margin-bottom: 40px;
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
