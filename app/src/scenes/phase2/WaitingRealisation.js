import React from "react";
import styled from "styled-components";
import NextStep from "./nextStep";
import { Link } from "react-router-dom";

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
              Consulter des milliers de missions disponibles pour la réalisation de votre phase 2, candidatez-y, <strong>classez vos choix</strong> et
              <strong>suivez vos candidatures</strong>
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
const Hero = styled.div`
  border-radius: 0.5rem;
  margin: 1rem auto;
  max-width: 80rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  .content {
    width: 65%;
    @media (max-width: 768px) {
      width: 100%;
    }
    padding: 60px 30px 60px 50px;
    position: relative;
    background-color: #fff;
    > * {
      position: relative;
      z-index: 2;
    }
  }
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
    -webkit-box-orient: vertical;
    overflow: hidden;
    a {
      color: #5949d0;
      :hover {
        text-decoration: underline;
      }
    }
  }
  .thumb {
    min-height: 400px;
    background: url(${require("../../assets/phase3.jpg")}) no-repeat center;
    background-size: cover;
    flex: 1;
  }
`;
