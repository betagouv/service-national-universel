import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  // See: https://trello.com/c/vOUIhdhu/406-volontaire-formulaire-all%C3%A9g%C3%A9-pour-les-2020
  const isBornBefore20030702 = young.cohort === "2020" && new Date(young.birthdateAt) < new Date("2003-07-02");
  const needsToRegisterToCohesion = !isBornBefore20030702;
  console.log({ isBornBefore20030702 });
  return (
    <>
      <Hero>
        <Content>
          <h1>
            <strong>{young.firstName},</strong> votre séjour a été annulé suite à la crise sanitaire !
          </h1>
          {isBornBefore20030702 ? (
            <p>
              Malheureusement, vous aurez 18 ans révolus au moment du séjour de cohésion, vous ne pouvez vous y inscrire. Si vous n'avez pas réalisé votre JDC, nous vous invitons à
              vous inscrire sur{" "}
              <a href="http://majdc.fr" target="_blank">
                majdc.fr
              </a>{" "}
              et à demander à être convoqué pour une session en ligne.
            </p>
          ) : null}
          {needsToRegisterToCohesion ? (
            <>
              <p>Vous pouvez cependant demander à participer à la session 2021, sous réserve de votre disponibilité du 21 juin au 2 juillet 2021.</p>{" "}
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
            </>
          ) : null}
        </Content>
        <div className="thumb" />
      </Hero>
    </>
  );
};

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
  margin: 1rem auto;
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
    background: url(${require("../../assets/phase3.jpg")}) no-repeat center;
    background-size: cover;
    flex: 1;
    -webkit-clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
    clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
  }
`;
