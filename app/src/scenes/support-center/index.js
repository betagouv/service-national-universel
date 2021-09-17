import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";

import { Hero, HeroContainer, Separator } from "../../components/Content";

//! This component isn't finished.

export default () => {
  const articles = [
    {
      title: "Je cherche une mission",
      body: `Depuis l'onglet "Mission d'intérêt général", cliquez sur la rubrique...`,
      url: "https://support.selego.co/help/fr-fr/13-phase-2-mission-d-interet-general/33-je-cherche-une-mission-mig"
    },
    {
      title: "Je modifie mon identifiant e-mail",
      body: `Connectez vous à votre espace volontaire, accédez à "Mon profil"...`,
      url: "https://support.selego.co/help/fr-fr/10-mon-compte/51-je-modifie-mon-identifiant-email"
    },
    {
      title: "Je consulte mes missions réalisées",
      body: `Les missions réalisées correspondent aux missions que vous avez déjà...`,
      url: "https://support.selego.co/help/fr-fr/13-phase-2-mission-d-interet-general/38-je-consulte-mes-missions-realisees"
    }
  ]
  return (
    <HeroContainer>
      <Container>
        <section className="help-section">
          <h2>Besoin d'aide ?</h2>
          <p style={{ color: "#6B7280", }}>Vous souhaitez en savoir plus sur les phases de votre parcours volontaire ou sur le fonctionnement de votre espace ? N'hésitez pas à consulter notre <strong>base de connaissance</strong> !<br /> Vous avez un problème technique ou souhaitez contacter un référent ? Ouvrez un ticket auprès de notre service de support.</p>
          <LinkButton href="https://support.selego.co/help/fr-fr" target="_blank">
            Base de connaissance
          </LinkButton>
          <InternalLink to="/ticket">
            Ouvrir un ticket
          </InternalLink>
        </section>
        <Card>
          <h4 style={{ marginLeft: "0.5rem" }}>
            Quelques articles pour vous aider :
          </h4>
          <div className="division">
            {articles.map((article) => (
              <div className="block" key={article.url}>
                <h6>{article.title}</h6>
                <p>{article.body} <a className="block-link" href={article.url} target="_blank">Lire la suite</a></p>
              </div>
            ))}
          </div>
        </Card>
      </Container>
    </HeroContainer>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .help-section {
    max-width: 500px;
    text-align: center;
    margin: 0 20px;
  }
  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-around;
    .help-section {
      text-align: left;
    }
  }
`;

const LinkButton = styled.a`
  background-color: #5245cc;
  border: none;
  border-radius: 5px;
  padding: 12px 25px;
  margin-right: 0.3rem;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  transition: opacity 0.3s;
  :hover {
    color: #fff;
    background: #463bad;
  }
`;
const InternalLink = styled(NavLink)`
  background-color: #5245cc;
  border: none;
  border-radius: 5px;
  padding: 12px 25px;
  margin-left: 0.3rem;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  transition: opacity 0.3s;
  :hover {
    color: #fff;
    background: #463bad;
  }
`;

const Card = styled.div`
  margin-top: 2rem;
  .division {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .block {
    display: flex;
    flex-direction: column;
    padding: 1.3rem;
    margin: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-radius: 0.5rem;
  }
  .block p, .block a {
    margin: 0;
    font-size: 0.9rem;
  }
  @media (min-width: 1024px) {
    margin-top: 0;
  }
`
