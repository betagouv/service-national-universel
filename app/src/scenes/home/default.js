import React, { useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { translate, PHASE_STATUS_COLOR } from "../../utils";
import Hero from "../../components/Hero";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const is2020 = young.cohort === "2020";
  const [showAlert, setShowAlert] = useState(!is2020);

  const goTo = (id) => {
    if (document.getElementById) {
      const yOffset = -70; // header's height
      const element = document.getElementById(id);
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <>
      <Hero>
        {showAlert && (
          <Alert>
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
          <WrapperItem>
            <div className="title">
              1. Un séjour de cohésion <Tag color={PHASE_STATUS_COLOR[young.statusPhase1]}>{translate(young.statusPhase1)}</Tag>
            </div>
          </WrapperItem>
          <WrapperItem>
            <div className="title">
              2. Une première mission d'intérêt général <Tag color={PHASE_STATUS_COLOR[young.statusPhase2]}>{translate(young.statusPhase2)}</Tag>
            </div>
          </WrapperItem>
          <WrapperItem>
            <div className="title">
              3. Un engagement vers une société plus solidaire <Tag color={PHASE_STATUS_COLOR[young.statusPhase3]}>{translate(young.statusPhase3)}</Tag>
            </div>
          </WrapperItem>
        </Content>
        <div className="thumb" />
      </Hero>
    </>
  );
};

const WrapperItem = styled.div`
  margin-bottom: 1rem;
  .info {
    margin-left: 1.5rem;
    .subtitle {
      color: #6b7280;
      font-size: 0.875rem !important;
      font-weight: 500;
    }
    .link {
      color: #6b7280;
      font-size: 0.875rem;
      font-weight: 400;
      span {
        color: #5145cd;
        cursor: pointer;
      }
    }
  }
  .title {
    color: #161e2e;
    font-size: 1.25rem !important;
    font-weight: 500;
  }
`;

const Content = styled.div`
  margin-top: ${({ showAlert }) => (showAlert ? "2rem" : "")};
  width: 50%;
  padding: 60px 30px 60px 50px;
  @media (max-width: 768px) {
    width: 100%;
    padding: 30px 15px 30px 15px;
  }
  position: relative;
  background-color: #fff;
  > * {
    position: relative;
    z-index: 2;
  }
  .icon {
    margin-right: 1rem;
    svg {
      width: 1.5rem;
      stroke: #5145cd;
    }
  }
`;

const Alert = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #31c48d;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  padding: 10px 20px;
  position: absolute;
  z-index: 10;
  width: 100%;
  .text {
    margin: 0 20px;
    color: #fff;
    strong {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 3px;
    }
  }
  img {
    position: absolute;
    right: 0;
    margin-right: 1rem;
    cursor: pointer;
  }
`;

const Tag = styled.span`
  color: ${({ color }) => color || "#42389d"};
  background-color: ${({ color }) => (color && `${color}11`) || "#42389d22"};
  padding: 0.25rem 0.75rem;
  margin: 0 0.25rem;
  border-radius: 99999px;
  font-size: 0.85rem;
  white-space: nowrap;
  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.1rem 0.5rem;
  }
  svg {
    height: 1rem;
    margin: 0;
    margin-right: 0.2rem;
    padding: 0;
  }
`;
