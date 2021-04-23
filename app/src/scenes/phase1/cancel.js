import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";
import Hero from "../../components/Hero";

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
