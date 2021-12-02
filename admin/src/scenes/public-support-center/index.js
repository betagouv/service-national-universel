import React, { useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

//import { HeroContainer } from "../../components/Content";
import { colors } from "../../utils";
import { adminURL } from "../../config";
import ZammadForm from "./form";

const articles = [
  {
    title: "Je n'arrive pas à me connecter",
    emoji: "⛔",
    body: `Ces actions vous permettront de réinitialiser...`,
    url: "https://support.snu.gouv.fr/help/fr-fr/8-mon-compte/15-je-n-arrive-pas-a-me-connecter",
  },
  {
    title: "Je crée ma structure",
    emoji: "📝",
    body: `Connectez-vous à l'espace d'inscription structure...`,
    url: "https://support.snu.gouv.fr/help/fr-fr/8-mon-compte/45-je-cree-ma-structure",
  },
  {
    title: "Je crée une nouvelle mission",
    emoji: "📇",
    body: `Cliquez pour voir les instructions en vidéo.`,
    url: "https://support.snu.gouv.fr/help/fr-fr/9-mes-missions/183-je-cree-une-nouvelle-mission",
  },
  //! Ne pas supprimer, article en cours
  /* {
    title: "Je m'identifie via FranceConnect",
    emoji: "🌐",
    body: `Article en cours de rédaction`,
    url: "https://support.snu.gouv.fr/help/fr-fr/24-questions-frequemment-posees/160-je-m-identifie-via-franceconnect",
  }, */
];

export default function PublicSupportCenter() {
  const user = useSelector((state) => state.Auth.user);
  const [open, setOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <div style={{ paddingBottom: "5rem", paddingTop: "1rem" }}>
      <Container style={{ backdropFilter: "blur(6px)" }}>
        {!user && (
          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#6B7280" }}>
            Vous avez déjà un compte sur le site du SNU ?{" "}
            <a className="link" style={{ color: "#32257F", fontWeight: "bold" }} href={`${adminURL}/auth/login?redirect=besoin-d-aide`} target="_blank" rel="noopener noreferrer">
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
                <a className="link" href="https://support.snu.gouv.fr/help/fr-fr/2-responsable-de-structure" target="_blank" rel="noopener noreferrer">
                  base de connaissance
                </a>
              </strong>
              &nbsp;!
            </div>
            <div className="buttons">
              <LinkButton href="https://support.snu.gouv.fr/help/fr-fr/2-responsable-de-structure" target="_blank" rel="noopener noreferrer">
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
    </div>
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
