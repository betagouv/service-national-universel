import React from "react";
import styled from "styled-components";

import { HeroContainer } from "../../components/Content";
import { colors } from "../../utils";
import ZammadButton from "../../components/buttons/ZammadButton";

const articles = [
  {
    title: "Code de la route",
    emoji: "🚗",
    body: `L’accès à la plateforme en ligne d’apprentissage du code de la route...`,
    url: "https://support.snu.gouv.fr/help/fr-fr/3-volontaire/21-prise-en-charge-du-e-learning-et-de-l-examen-du-code-de-la-route",
  },
  {
    title: "Je cherche une MIG",
    emoji: "🔍",
    body: `Depuis l'onglet Mission d'intérêt général, cliquez sur la rubrique...`,
    url: "https://support.snu.gouv.fr/help/fr-fr/13-phase-2-mission-d-interet-general/33-je-cherche-une-mission-mig",
  },
  {
    title: "Comment se déroule ma phase 3 ?",
    emoji: "🌟",
    body: `Optionnelle, la phase 3 vous permet de poursuivre votre...`,
    url: "https://support.snu.gouv.fr/help/fr-fr/14-phase-3-l-engagement/61-comment-se-deroule-ma-phase-3",
  },
];

export default () => {

  return (
    <HeroContainer>
      <Container>
        <h4 style={{ textAlign: "center" }}>Besoin d'aide&nbsp;?</h4>
        <div className="help-section">
          <div className="help-section-block">
            <div className="help-section-text" style={{ color: "#6B7280" }}>
              Vous souhaitez en savoir plus sur les phases de votre parcours volontaire ou sur le fonctionnement de votre espace&nbsp;?
              N'hésitez pas à consulter notre{" "}
              <strong>
                <a className="link" href="https://support.snu.gouv.fr/help/fr-fr/3-volontaire" target="_blank" rel="noopener noreferrer">
                  base de connaissance
                </a>
              </strong>
              &nbsp;!
            </div>
            <div className="buttons">
              <LinkButton href="https://support.snu.gouv.fr/help/fr-fr/3-volontaire" target="_blank" rel="noopener noreferrer">
                Trouver&nbsp;ma&nbsp;réponse
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>
      <h4 style={{ marginLeft: "0.5rem" }}>Quelques articles pour vous aider&nbsp;:</h4>
      <Articles>
        {articles.map((article) => (
          <div className="block" key={article.url} onClick={() => window.open(article.url)}>
            <div className="block-title">
              <p>{article.emoji}</p>
              <h6>{article.title}</h6>
            </div>
            <p>{article.body}</p>
            <p>
              <a className="block-link" href={article.url} target="_blank">
                Lire la suite
              </a>
            </p>
          </div>
        ))}
      </Articles>
      <hr style={{ margin: "3rem auto", maxWidth: "600px" }} />
      <Container>
        <h4 style={{ textAlign: "center" }}>Vous n'avez pas trouvé de réponse à votre demande&nbsp;?</h4>
        <div className="help-section">
          <div className="help-section-block">
            <div className="help-section-text" style={{ color: "#6B7280" }}>
              N'hésitez pas à <strong>contacter notre service de support</strong>, nous vous répondrons dans les plus brefs délais !
            </div>
            <div className="buttons">
              <ZammadButton />
            </div>
          </div>
        </div>
      </Container>
    </HeroContainer>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  .help-section {
    padding: 0.5rem;
    margin: 1rem auto;
    max-width: 600px;
    .buttons {
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

const LinkButton = styled.button`
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
    color: #fff;
    background: #463bad;
  }
`;

const Articles = styled.div`
  min-width: 330px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  .block {
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
