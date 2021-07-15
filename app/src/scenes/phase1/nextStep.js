import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { YOUNG_STATUS_PHASE1 } from "snu-lib/constants";
import { HeroContainer, Hero } from "../../components/Content";
import ImageRight from "./ImageRight";
import AutoTest from "./AutoTest";
import MedicalFile from "./MedicalFile";

export default () => {
  const young = useSelector((state) => state.Auth.young);

  return (
    <HeroContainer>
      <Hero style={{ flexDirection: "column" }}>
        <Content style={{ width: "100%" }}>
          <h1>Prochaine étape</h1>
          {young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION ? (
            <>
              <p>
                Vous êtes actuellement <Tag>en&nbsp;attente&nbsp;d'affectation à un centre de cohésion.</Tag>
              </p>
              <p>Vous serez informé(e) par e-mail du lieu et des modalités de votre séjour fin mai.</p>
            </>
          ) : null}
          {young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_LIST ? (
            <>
              <p>
                Vous êtes actuellement <Tag>en&nbsp;attente&nbsp;d'affectation à un centre de cohésion.</Tag>
              </p>
              <p>Le SNU étant victime de son succès, nous oeuvrons pour vous trouver une place.</p>
              <p>Nous vous recontacterons par email au plus vite pour vous confirmer votre participation au séjour de cohésion.</p>
            </>
          ) : null}
        </Content>
        <MedicalFile />
        <ImageRight />
        <AutoTest />
      </Hero>
    </HeroContainer>
  );
};

const Tag = styled.span`
  color: #42389d;
  padding: 0.25rem 0.75rem;
  margin: 0 0.25rem;
  border-radius: 99999px;
  background-color: #e5edff;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.1rem 0.5rem;
  }
`;

const Content = styled.div`
  margin-top: ${({ showAlert }) => (showAlert ? "2rem" : "")};
  width: 65%;
  @media (max-width: 768px) {
    width: 100%;
  }
  padding: 60px 30px 60px 50px;
  @media (max-width: 768px) {
    width: 100%;
    padding: 30px 15px 30px 15px;
  }
  position: relative;
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
  :not(:last-child) {
    border-bottom-width: 1px;
    border-color: #d2d6dc;
    border-bottom-style: dashed;
  }
  h2 {
    font-size: 1.5rem;
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 700;
    line-height: 1;
  }
  p {
    color: #6b7280;
    margin-top: 0.5rem;
    font-size: 1.125rem !important;
    @media (max-width: 768px) {
      font-size: 0.8rem !important;
    }
    font-weight: 400 !important;
  }
`;
