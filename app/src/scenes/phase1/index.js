import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

export default () => {
  return (
    <>
      <Hero>
        <div className="content">
          <h1>
            <strong>Mon séjour de cohésion</strong>
          </h1>
          <p>
            Le SNU vous donne l'opportunité de découvrir la vie collective au sein d'un centre accueillant environ 200 jeunes venus de toute la France pour créer ainsi des liens
            nouveaux et développer votre culture de l’engagement et ainsi affirmer votre place dans la société.
          </p>
        </div>
        <div className="thumb" />
      </Hero>
      <Hero>
        <Content style={{ width: "100%" }}>
          <h1>Prochaine étape</h1>
          <p>
            Vous êtes actuellement <b>en attente d'affectation à un centre de cohésion.</b>
          </p>
          <p>Vous serez prochainement informé par e-mail du lieu et des modalités de votre séjour.</p>
          <p style={{ color: "#161e2e", fontSize: "1.5rem", fontWeight: 700 }}>Fiche sanitaire</p>
          <p>
            Vous pouvez dores-et-déjà télécharger la <b>fiche sanitaire</b> ci-dessous.
          </p>
          <p>
            Vous devrez l'imprimer et la renvoyer <b>complétée</b> et <b>signée</b> par votre représentant légal au plus tard le <b>4 juin 2021</b>. L'adresse de destination vous
            sera communiquée sur cette page, une fois votre lieu d'affectation connu.
          </p>
          <BackButton>Télécharger la fiche sanitaire</BackButton>
        </Content>
      </Hero>
    </>
  );
};

const Hero = styled.div`
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  .content {
    width: 65%;
    padding: 60px 30px 60px 50px;
    position: relative;
    background-color: #fff;
    > * {
      position: relative;
      z-index: 2;
    }
  }
  h1 {
    font-size: 50px;
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 400;
    line-height: 1;
  }
  p {
    color: #6b7280;
    font-size: 16px;
    font-weight: 400;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .thumb {
    background: url(${require("../../assets/phase3.jpg")}) no-repeat center;
    background-size: cover;
    flex: 1;
  }
`;

const BackButton = styled.button`
  color: #374151;
  margin-top: 1rem;
  background-color: #fff;
  padding: 0.5rem 1rem;
  border: 1px solid #d2d6dc;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
  :hover {
    opacity: 0.9;
  }
`;

const Content = styled.div`
  margin-top: 2rem;
  width: 65%;
  padding: 60px 30px 60px 50px;
  position: relative;
  background-color: #fff;
  > * {
    position: relative;
    z-index: 2;
  }
`;
