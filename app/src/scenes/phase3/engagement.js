import React from "react";
import { Col, Container, Row } from "reactstrap";
import styled from "styled-components";
import ProgramCard from "./components/programCard";

export default () => {
  return (
    <Container>
      <Heading>
        <h1>Les grands programmes d'engagement</h1>
        <p>Rejoignez plus 100 000 jeunes français déjà engagés dans de grandes causes</p>
      </Heading>
      <Row>
        <Col md={4}>
          <ProgramCard title="Le Service Civique" image={require("../../assets/engagement-1.jpg")} details="Une mission pour chacun au service de tous" />
        </Col>
        <Col md={4}>
          <ProgramCard title="Les Sapeurs-Pompiers de France" image={require("../../assets/engagement-2.jpg")} details="Une formation pour devenir Jeune Sapeur-Pompier" />
        </Col>
        <Col md={4}>
          <ProgramCard title="Plan Mercredi" image={require("../../assets/engagement-3.png")} details="Une ambition éducative pour tous les enfants" />
        </Col>
        <Col md={4}>
          <ProgramCard title="Le Service Civique" image={require("../../assets/engagement-1.jpg")} details="Une mission pour chacun au service de tous" />
        </Col>
        <Col md={4}>
          <ProgramCard title="Les Sapeurs-Pompiers de France" image={require("../../assets/engagement-2.jpg")} details="Une formation pour devenir Jeune Sapeur-Pompier" />
        </Col>
        <Col md={4}>
          <ProgramCard title="Plan Mercredi" image={require("../../assets/engagement-3.png")} details="Une ambition éducative pour tous les enfants" />
        </Col>
        <Col md={4}>
          <ProgramCard title="Le Service Civique" image={require("../../assets/engagement-1.jpg")} details="Une mission pour chacun au service de tous" />
        </Col>
        <Col md={4}>
          <ProgramCard title="Les Sapeurs-Pompiers de France" image={require("../../assets/engagement-2.jpg")} details="Une formation pour devenir Jeune Sapeur-Pompier" />
        </Col>
        <Col md={4}>
          <ProgramCard title="Plan Mercredi" image={require("../../assets/engagement-3.png")} details="Une ambition éducative pour tous les enfants" />
        </Col>
      </Row>
    </Container>
  );
};

const Heading = styled.div`
  margin-bottom: 40px;
  h1 {
    color: #161e2e;
    font-size: 46px;
    font-weight: 700;
  }
  p {
    color: #6b7280;
    font-size: 18px;
  }
`;
