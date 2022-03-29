import React from "react";
import { useSelector } from "react-redux";
import { HeroContainer, Hero } from "../../components/Content";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { youngCanChangeSession } from "snu-lib";

export default function NotDone() {
  const young = useSelector((state) => state.Auth.young) || {};

  return (
    <HeroContainer>
      <Hero>
        <div className="content">
          <h1>
            <strong>{young.firstName}, vous n&apos;avez pas réalisé votre séjour de cohésion !</strong>
          </h1>
          <p>
            <b>Votre phase 1 n&apos;est donc pas validée.</b>
          </p>
          <p>Nous vous invitons à vous rapprocher de votre référent déparemental pour la suite de votre parcours.</p>
          {youngCanChangeSession({ cohort: young.cohort, status: young.statusPhase1 }) ? <Button to="/changer-de-sejour">Changer mes dates de séjour de cohésion</Button> : null}
        </div>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
}
const Button = styled(Link)`
  width: fit-content;
  cursor: pointer;
  color: #374151;
  text-align: center;
  margin: 1rem 0;
  background-color: #fff;
  padding: 0.5rem 1rem;
  border: 1px solid #d2d6dc;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
  :hover {
    opacity: 0.9;
  }
  a {
    color: #374151;
  }
`;
