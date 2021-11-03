import React, { useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { translate, PHASE_STATUS_COLOR } from "../../utils";
import { HeroContainer, Hero, Content, Alert } from "../../components/Content";
import Badge from "../../components/Badge";
import { Link } from "react-router-dom";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const is2021 = young.cohort === "2021";
  const [showAlert, setShowAlert] = useState(!is2021);

  return (
    <HeroContainer>
      <Hero>
        {showAlert && (
          <Alert color="#31c48d">
            <div className="text">
              <strong>INSCRIPTION VALIDÉE</strong>
            </div>
            <img src={require("../../assets/close.svg")} height={15} onClick={() => setShowAlert(false)} />
          </Alert>
        )}
        <Content showAlert={showAlert}>
          <h1>
            <strong>{young.firstName},</strong> ravis de vous retrouver !
          </h1>
          <p>Votre espace volontaire vous accompagne à chaque étape de votre SNU.</p>
          <p style={{ color: "#161e2e", fontSize: "1.5rem", fontWeight: 700 }}>Votre parcours</p>
          <WrapperItem to="/phase1">
            <div className="title">
              <span className="link">1. Un séjour de cohésion</span>{" "}
              <Badge style={{ margin: 0 }} text={translate(young.statusPhase1)} color={PHASE_STATUS_COLOR[young.statusPhase1]} />
            </div>
          </WrapperItem>
          <WrapperItem to="/phase2">
            <div className="title">
              <span className="link">2. Une première mission d'intérêt général</span>{" "}
              <Badge style={{ margin: 0 }} text={translate(young.statusPhase2)} color={PHASE_STATUS_COLOR[young.statusPhase2]} />
            </div>
          </WrapperItem>
          <WrapperItem to="/phase3">
            <div className="title">
              <span className="link">3. Un engagement vers une société plus solidaire</span>
              <Badge style={{ margin: 0 }} text={translate(young.statusPhase3)} color={PHASE_STATUS_COLOR[young.statusPhase3]} />
            </div>
          </WrapperItem>
        </Content>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
};

const WrapperItem = styled(Link)`
  .title {
    font-size: 1.1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    color: #161e2e;
    margin-bottom: 0.8rem;
    font-weight: 500;
    .link:hover {
      text-decoration: underline;
    }
  }
  @media (max-width: 768px) {
    margin-bottom: 1rem;
    .title {
      flex-direction: column;
      font-size: 1rem;
      .link {
        margin-right: 0.5rem;
      }
    }
  }
`;
