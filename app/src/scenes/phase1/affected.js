import React from "react";
import styled from "styled-components";
import Hero from "../../components/Hero";
import NextStep from "./nextStep";

export default () => {
  return (
    <>
      <Hero>
        <div className="content">
          <h1>
            <strong>Mon séjour de cohésion</strong>
          </h1>
          <p>
            Le SNU vous donne l'opportunité de découvrir la vie collective au sein d'un centre accueillant environ 200 jeunes de votre région pour créer ainsi des liens nouveaux et
            développer votre culture de l’engagement et ainsi affirmer votre place dans la société.
          </p>
          <Separator />
          <p>
            <strong>Votre convocation</strong>
            <br />
            Vous êtes actuellement affecté(e) à un centre de cohésion.
          </p>
        </div>
        <div className="thumb" />
      </Hero>
      <NextStep />
    </>
  );
};

const Separator = styled.hr`
  margin: 2.5rem 0;
  height: 1px;
  border-style: none;
  background-color: #e5e7eb;
`;
