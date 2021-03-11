import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";
import NextStep from "../../phase2/nextStep";
import { INTEREST_MISSION_LIMIT_DATE, PHASE_STATUS_COLOR, translate } from "../../../utils";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  // See: https://trello.com/c/vOUIhdhu/406-volontaire-formulaire-all%C3%A9g%C3%A9-pour-les-2020
  const isBornBefore20030702 = young.cohort === "2020" && new Date(young.birthdateAt) < new Date("2003-07-02");
  const needsToRegisterToCohesion = !isBornBefore20030702;

  return (
    <>
      <Hero>
        <Content>
          <h1>
            <strong>{young.firstName},</strong> ravis de vous retrouver !
          </h1>
          <p>Votre espace volontaire vous accompagne à chaque étape de votre SNU.</p>
          <Separator />
          <p style={{ color: "#161e2e", fontSize: "1.5rem", fontWeight: 700 }}>Votre parcours</p>
          <WrapperItem>
            <div className="title">
              1. Un séjour de cohésion <Tag color={PHASE_STATUS_COLOR[young.statusPhase1]}>{translate(young.statusPhase1)}</Tag>
            </div>
            <div className="info">
              <div className="subtitle">Séjour annulé suite à la crise sanitaire.</div>
              {isBornBefore20030702 ? (
                <div className="subtitle more-info">
                  Malheureusement, vous aurez 18 ans révolus au moment du séjour de cohésion, vous ne pouvez vous y inscrire. Si vous n'avez pas réalisé votre JDC, nous vous
                  invitons à vous inscrire sur{" "}
                  <a href="http://majdc.fr" target="_blank">
                    majdc.fr
                  </a>{" "}
                  et à demander à être convoqué pour une session en ligne.
                </div>
              ) : null}
              {needsToRegisterToCohesion ? (
                <div className="subtitle more-info">
                  Vous pouvez cependant demander à participer à la session 2021, sous réserve de votre disponibilité du 21 juin au 2 juillet 2021.
                  <Link to="/cohesion/consentements">
                    <Button>Je confirme ma participation au séjour de cohésion</Button>
                  </Link>
                  <div style={{ marginTop: "1rem", fontStyle: "italic" }}>
                    Si vous n'êtes pas disponible sur ces dates et que vous n'avez pas réalisé votre JDC, nous vous invitons à vous inscrire sur{" "}
                    <a href="http://majdc.fr" target="_blank">
                      majdc.fr
                    </a>{" "}
                    et à demander à être convoqué pour une session en ligne.
                  </div>
                </div>
              ) : null}
            </div>
          </WrapperItem>
          <WrapperItem>
            <div className="title">
              2. Une première mission d'intérêt général <Tag color={PHASE_STATUS_COLOR[young.statusPhase2]}>{translate(young.statusPhase2)}</Tag>
            </div>
            <div className="info">
              <div className="subtitle">À réaliser dans l’année, jusqu’au {INTEREST_MISSION_LIMIT_DATE[young.cohort]}.</div>
            </div>
          </WrapperItem>
          <WrapperItem>
            <div className="title">3. Un engagement vers une société plus solidaire</div>
            <div className="info">
              <div className="subtitle">À réaliser avant vos 25 ans</div>
            </div>
          </WrapperItem>
        </Content>
        <div className="thumb" />
      </Hero>
      <NextStep />
    </>
  );
};

const Tag = styled.span`
  color: ${({ color }) => color || "#42389d"};
  background-color: ${({ color }) => `${color}11` || "#42389d22"};
  padding: 0.25rem 0.75rem;
  margin: 0 0.25rem;
  border-radius: 99999px;
  font-size: 0.85rem;
  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.1rem 0.5rem;
  }
`;

const WrapperItem = styled.div`
  margin-bottom: 1rem;
  .info {
    margin-left: 1.5rem;
    .subtitle {
      color: #6b7280;
      font-size: 0.875rem !important;
      font-weight: 500;
    }
    .more-info {
      font-weight: normal;
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

const Separator = styled.hr`
  margin: 2.5rem 0;
  height: 1px;
  border-style: none;
  background-color: #e5e7eb;
`;

const Content = styled.div`
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

const Button = styled.button`
  display: inline-block;
  padding: 10px 40px;
  background-color: #31c48d;
  color: #fff;
  font-size: 16px;
  text-align: center;
  font-weight: 700;
  margin: 25px auto 10px;
  border-radius: 30px;
  border: none;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
`;

const Hero = styled.div`
  border-radius: 0.5rem;
  @media (max-width: 768px) {
    border-radius: 0;
  }
  max-width: 80rem;
  margin: 0 auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  h1 {
    font-size: 3rem;
    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 500;
    line-height: 1;
  }
  p {
    color: #6b7280;
    font-size: 1.25rem;
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    font-weight: 400;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .thumb {
    min-height: 400px;
    background: url(${require("../../../assets/phase3.jpg")}) no-repeat center;
    background-size: cover;
    flex: 1;
    -webkit-clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
    clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
  }
`;
