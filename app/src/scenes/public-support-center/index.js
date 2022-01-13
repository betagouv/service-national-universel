import React, { useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import { HeroContainer } from "../../components/Content";
import { supportURL } from "../../config";
import { colors } from "../../utils";
import ZammadForm from "./form";

const articles = [
  {
    title: "Mot de passe oublié (ou incorrect)",
    emoji: "🔐",
    body: `Pour se connecter à votre compte SNU, rendez-vous sur...`,
    url: `${supportURL}/base-de-connaissance/jai-oublie-mon-mot-de-passe-volontaire-1?type=article`,
  },
  {
    title: "Est-ce que le SNU est obligatoire ?",
    emoji: "❓",
    body: `Le SNU est pour le moment un dispositif basé sur le volontariat...`,
    url: `${supportURL}/base-de-connaissance/est-ce-que-le-snu-est-obligatoire?type=article`,
  },
  {
    title: "A qui s'adresse le SNU ?",
    emoji: "👍",
    body: `Le Service National Universel s'adresse : aux jeunes de nationalité...`,
    url: `${supportURL}/base-de-connaissance/a-qui-sadresse-le-snu?type=article`,
  },
  {
    title: "Le SNU est-il payant ?",
    emoji: "👛",
    body: `La participation au SNU est gratuite ! Le séjour de cohésion...`,
    url: `${supportURL}/base-de-connaissance/le-snu-est-il-payant-frais-1?type=article`,
  },
  {
    title: "Je me connecte à mon compte",
    emoji: "🔐",
    body: `Pour vous connecter : rendez-vous sur...`,
    url: `${supportURL}/base-de-connaissance/je-me-connecte-a-mon-compte-1?type=article`,
  },
  {
    title: "J'ai oublié mon identifiant (mail)",
    emoji: "⛔",
    body: `La plateforme bloque la création de nouveau dossier d'inscription...`,
    url: `${supportURL}/base-de-connaissance/comment-recuperer-mon-identifiant-dossier-deja-inscrit-1?type=article`,
  },
  {
    title: "J'étais inscrit en 2021, comment me réinscrire en 2022 ?",
    emoji: "📅",
    body: `En 2021, vous avez déjà rempli un dossier d'inscription...`,
    url: `${supportURL}/base-de-connaissance/jetais-inscrit-en-2021-comment-me-reinscrire-en-2022-1-1?type=article`,
  },
  {
    title: "Prise en charge du code de la route",
    emoji: "🚗",
    body: `L'accès à la plateforme en ligne d'apprentissage du code de la...`,
    url: `${supportURL}/base-de-connaissance/permis-et-code-de-la-route-1?type=article`,
  },
  {
    title: "Le SNU remplace-t-il la Journée Défense et citoyenneté (JDC)",
    emoji: "📣",
    body: `La Journée de Défense et Citoyenneté (JDC) est obligatoire pour tous...`,
    url: `${supportURL}/base-de-connaissance/journee-defense-et-citoyennete-1?type=article`,
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
              <a className="block-link" href={article.url} target="_blank" rel="noreferrer">
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
