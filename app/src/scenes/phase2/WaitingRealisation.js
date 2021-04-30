import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Hero from "../../components/Hero";

export default () => {
  const renderStep = () => {
    return (
      <>
        <Hero>
          <div className="content">
            <h1>
              Réalisez vos <strong>84 heures de mission d'intérêt général</strong>
            </h1>
            <p>
              Partez à la découverte de l'engagement en réalisant 84 heures de mission d'intérêt général, au sein d'une ou plusieurs structures, en contribuant à leurs activités
              concrètes !
            </p>
            <p>A vous de jouez : candidatez directement sur des missions parmi celles proposées dans cet espace !</p>
            <Separator />
            <p>
              <strong>Préférences de missions</strong>
              <br />
              Ces choix permettront à l'administration de vous proposer des missions en cohérence avec vos motivations.
              <br />
              <Link to="/preferences">Renseigner mes préférences de missions {">"}</Link>
            </p>
            <p>
              <strong>Vos missions d'intérêt général</strong>
              <br />
              Consulter des milliers de missions disponibles pour la réalisation de votre phase 2, candidatez-y, classez vos choix et suivez vos candidatures
              <br />
              <Link to="/mission">Trouver une mission {">"}</Link>
            </p>
          </div>
          <div className="thumb" />
        </Hero>
      </>
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
