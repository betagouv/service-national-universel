import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { HeroContainer, Hero } from "../../../components/Content";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};

  const renderStep = () => {
    return (
      <HeroContainer>
        <Hero>
          <div className="content">
            <h1>
              <strong>{young.firstName}</strong>, votre Phase 3 est en attente de validation !
            </h1>
            <p>Votre tuteur de mission doit examiner le formulaire de validation que vous avez déposé puis le confirmer.</p>
            <Separator />
            <p>
              <strong>Suivre la validation de mon engagement prolongé</strong>
              <br />
              Vous pouvez suivre l&apos;avancement de la validation de votre mission par votre tuteur.
              <br />
              <Link to="/phase3/valider">Suivre l&apos;avancement {">"}</Link>
            </p>
          </div>
          <div className="thumb" />
        </Hero>
      </HeroContainer>
    );
  };

  return renderStep();
};
const Separator = styled.hr`
  margin: 2.5rem 0;
  height: 1px;
  border-style: none;
  background-color: #e5e7eb;
`;
