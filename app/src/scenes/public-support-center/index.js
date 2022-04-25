import React, { useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import { HeroContainer } from "../../components/Content";
import { supportURL } from "../../config";
import { colors, urlWithScheme } from "../../utils";
import ZammadForm from "./form";

const articles = [
  {
    title: "Mon affectation (lieu de séjour)",
    emoji: "🗺️",
    body: `Votre séjour de cohésion se déroule dans un centre d'accueil de votre région, ...`,
    url: `${supportURL}/base-de-connaissance/mon-affectation-lieu-de-sejour`,
  },
  {
    title: "Le transport",
    emoji: "🚌",
    body: `Concernant le transport pour le séjour de cohésion, ...`,
    url: `${supportURL}/base-de-connaissance/le-transport`,
  },
  {
    title: "Les documents à fournir",
    emoji: "📋",
    body: `Les documents du formulaire d’inscription, ...`,
    url: `${supportURL}/base-de-connaissance/les-documents-a-fournir`,
  },
  {
    title: "Dans ma valise : matériel (trousseau)",
    emoji: "🧳",
    body: `Que dois-je emporter ? Un trousseau indicatif et national sera publié sur votre espace volontaire...`,
    url: `${supportURL}/base-de-connaissance/dans-ma-valise-materiel-trousseau`,
  },
  {
    title: "Je me connecte à mon compte",
    emoji: "🔐",
    body: `Pour vous connecter : rendez-vous sur...`,
    url: `${supportURL}/base-de-connaissance/je-me-connecte-a-mon-compte`,
  },
  {
    title: "J'ai oublié mon identifiant (mail)",
    emoji: "⛔",
    body: `La plateforme bloque la création de nouveau dossier d'inscription...`,
    url: `${supportURL}/base-de-connaissance/comment-recuperer-mon-identifiant-dossier-deja-inscrit`,
  },
  {
    title: "Pendant le séjour (Règles et informations)",
    emoji: "🌲",
    body: `...`,
    url: `${supportURL}/base-de-connaissance/pendant-le-sejour-regles-et-informations`,
  },
  {
    title: "Pourrais-je quitter le centre pendant le séjour ?",
    emoji: "🏃",
    body: `Pour des soucis d’organisation, il n’est pas possible de déroger aux dates prévues pour le séjour de cohésion...`,
    url: `${supportURL}/base-de-connaissance/pourrais-je-quitter-le-centre-pendant-le-sejour`,
  },
  {
    title: "Je me désiste du SNU",
    emoji: "🙁",
    body: `Attention cette action est irréversible, et annule votre entière participation au parcours du SNU. Vous ne pourrez pas revenir en arrière.`,
    url: `${supportURL}/base-de-connaissance/je-me-desiste-du-snu`,
  },
];

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const [open, setOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <HeroContainer style={{ paddingBottom: "5rem" }}>
      <Container style={{ backdropFilter: "blur(6px)" }}>
        {!young && (
          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#6B7280" }}>
            Vous avez déjà un compte sur le site du SNU ?{" "}
            <a
              className="link"
              style={{ color: "#32257F", fontWeight: "bold" }}
              href="https://moncompte.snu.gouv.fr/auth/login?redirect=besoin-d-aide"
              target="_blank"
              rel="noopener noreferrer">
              Connectez-vous
            </a>
          </p>
        )}
        <h4 style={{ textAlign: "center" }}>Besoin d&apos;aide&nbsp;?</h4>
        <div className="help-section">
          <div className="help-section-block">
            <div className="help-section-text" style={{ color: "#6B7280" }}>
              Vous souhaitez en savoir plus sur les phases du Service National Universel ou sur les autres formes d&apos;engagement&nbsp;?
              <br />
              N&apos;hésitez pas à consulter notre{" "}
              <strong>
                <a className="link" href={`${supportURL}/base-de-connaissance`} target="_blank" rel="noopener noreferrer">
                  base de connaissance
                </a>
              </strong>
              &nbsp;!
            </div>
            <div className="buttons">
              <LinkButton href={`${supportURL}/base-de-connaissance`} target="_blank" rel="noopener noreferrer">
                Trouver&nbsp;ma&nbsp;réponse
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>
      <h4 style={{ margin: "1rem 0", textAlign: "center" }}>Quelques articles pour vous aider</h4>
      <Articles>
        {articles.map((article) => (
          <div className="block" key={article.url} onClick={() => window.open(article.url)}>
            <div className="block-title">
              <p>{article.emoji}</p>
              <h6>{article.title}</h6>
            </div>
            <p>{article.body}</p>
            <p>
              <a className="block-link" href={urlWithScheme(article.url)} target="_blank" rel="noreferrer">
                Lire la suite
              </a>
            </p>
          </div>
        ))}
      </Articles>
      <hr style={{ margin: "3rem auto", maxWidth: "600px" }} />
      <Container>
        <h4 style={{ textAlign: "center" }}>Vous n&apos;avez pas trouvé de réponse à votre demande&nbsp;?</h4>
        <div className="help-section">
          <div className="help-section-block">
            <div className="help-section-text" style={{ color: "#6B7280", marginBottom: "0.5rem" }}>
              Contactez nos équipes. Nous travaillons généralement du <strong>lundi au vendredi de 9h00 à 18h00</strong> et traiterons votre demande dès que possible. Vous recevrez
              une réponse par mail.
            </div>
            <div className="zammad-container">
              <LinkButton onClick={() => setOpen(true)}>Contacter quelqu&apos;un</LinkButton>
            </div>
          </div>
        </div>
        {open && <ZammadForm setOpen={setOpen} setSuccessMessage={setSuccessMessage} />}
        {successMessage && <p style={{ color: "#6B7280" }}>{successMessage}</p>}
      </Container>
    </HeroContainer>
  );
}

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .help-section {
    padding: 0.5rem;
    margin: 1rem auto;
    max-width: 600px;
    .buttons {
      margin: 0.8rem 0;
      flex: 1;
    }
    .zammad-container {
      margin-top: 0.7rem;
      flex: 1;
    }
  }
  .help-section-block {
    display: grid;
    grid-template-rows: 2fr 1fr;
    text-align: center;
  }
  .link {
    color: #6b7280;
    :hover {
      text-decoration: underline;
    }
  }
  @media (max-width: 1024px) {
    .help-section {
      flex-direction: column;
      align-items: center;
    }
    .help-section-text {
      text-align: center;
    }
  }
`;

const LinkButton = styled.a`
  max-width: 230px;
  margin: 0.3rem;
  background-color: #5245cc;
  border: none;
  border-radius: 5px;
  padding: 12px 25px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  transition: opacity 0.3s;
  :hover {
    cursor: pointer;
    color: #fff;
    background: #463bad;
  }
`;

const Articles = styled.div`
  min-width: 330px;
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  .block {
    height: 190px;
    max-width: 285px;
    min-width: 285px;
    background-color: #fff;
    flex: 1;
    flex-basis: 230px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1.3rem;
    margin: 0.5rem;
    box-shadow: 0 0 15px -3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    :hover {
      box-shadow: 0 0 15px 3px rgba(0, 0, 0, 0.2);
    }
    border-radius: 0.5rem;
  }
  .block-title {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .block-title h6 {
    padding-left: 0.8rem;
    margin: 0;
  }
  .block p,
  .block a {
    margin: 0;
    font-size: 0.9rem;
  }
  .block-link {
    color: ${colors.purple};
    :hover {
      text-decoration: underline;
    }
  }
`;
