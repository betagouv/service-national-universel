import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { translate, PHASE_STATUS_COLOR, YOUNG_STATUS_PHASE1, translatePhase1, translatePhase2 } from "../../utils";
import { HeroContainer, Hero, Content } from "../../components/Content";
import Badge from "../../components/Badge";
import { Link } from "react-router-dom";

export default function HomeDefault() {
  const young = useSelector((state) => state.Auth.young);
  return (
    <HeroContainer>
      <Hero>
        <Content>
          <h1>
            <strong>{young.firstName},</strong> ravis de vous retrouver !
          </h1>
          <p>Votre espace volontaire vous accompagne à chaque étape de votre SNU.</p>
          <p style={{ color: "#161e2e", fontSize: "1.5rem", fontWeight: 700 }}>Votre parcours</p>
          <WrapperItem to="/phase1">
            <div className="title">
              <span className="link">1. Un séjour de cohésion</span>{" "}
              <Badge style={{ margin: 0 }} text={translatePhase1(young.statusPhase1)} color={PHASE_STATUS_COLOR[young.statusPhase1]} />
            </div>
          </WrapperItem>
          <WrapperItem to="/phase2">
            <div className="title">
              <span className="link">2. Une première mission d&apos;intérêt général</span>{" "}
              <Badge style={{ margin: 0 }} text={translatePhase2(young.statusPhase2)} color={PHASE_STATUS_COLOR[young.statusPhase2]} />
            </div>
          </WrapperItem>
          <WrapperItem to="/phase3">
            <div className="title">
              <span className="link">3. Un engagement vers une société plus solidaire</span>
              <Badge style={{ margin: 0 }} text={translate(young.statusPhase3)} color={PHASE_STATUS_COLOR[young.statusPhase3]} />
            </div>
          </WrapperItem>
          {[YOUNG_STATUS_PHASE1.AFFECTED].includes(young.statusPhase1) ? (
            <InfoContainer to="/phase1">
              <div>
                <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M16 8A8 8 0 110 8a8 8 0 0116 0zM9 4a1 1 0 11-2 0 1 1 0 012 0zM7 7a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2V8a1 1 0 00-1-1H7z"
                    fill="#32257F"
                  />
                </svg>
                Préparez votre séjour de cohésion
              </div>
              Documents à fournir →
            </InfoContainer>
          ) : null}
        </Content>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
}

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
const InfoContainer = styled(Link)`
  display: flex;
  justify-content: space-between;
  background: rgba(79, 70, 229, 0.1);
  padding: 1rem;
  color: #32257f;
  border-radius: 6px;
  font-size: 1rem;
  svg {
    margin-right: 0.3rem;
  }
  :hover {
    color: #32257f;
    opacity: 0.8;
    cursor: pointer;
  }
`;
