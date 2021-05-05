import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { HeroContainer, Hero } from "../../components/Hero";

export default () => {
  const renderStep = () => {
    return (
      <HeroContainer>
        <Hero>
          <div className="content">
            <h1>
              Réalisez vos <strong>84 heures de mission d'intérêt général</strong>
            </h1>
            <p>
              Partez à la découverte de l'engagement en réalisant 84 heures de mission d'intérêt général, au sein d'une ou plusieurs structures, en contribuant à leurs activités
              concrètes !
            </p>
            <Separator />
            <p>
              <strong>Vos missions d'intérêt général</strong>
              <br />
              <Link to="/mission">Trouver une mission {">"}</Link>
              <br />
              <Link to="/candidature">Suivez vos candidatures {">"}</Link>
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
