import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useSelector } from "react-redux";

import { HeroContainer } from "../../components/Content";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { ticketStateNameById, colors } from "../../utils";
import MailCloseIcon from "../../components/MailCloseIcon";
import MailOpenIcon from "../../components/MailOpenIcon";
import SuccessIcon from "../../components/SuccessIcon";

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
  const [userTickets, setUserTickets] = useState(null);
  const young = useSelector((state) => state.Auth.young);

  dayjs.extend(relativeTime).locale("fr");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get("/support-center/ticket?withArticles=true");
        if (!response.ok) return console.log(response);
        setUserTickets(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTickets();
  }, []);

  const getLastContactName = (array) => {
    const lastTicketFromAgent = array?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))?.find((e) => e.created_by !== young.email);
    return lastTicketFromAgent?.from;
  };

  const displayState = (state) => {
    if (state === "ouvert")
      return (
        <StateContainer style={{ display: "flex" }}>
          <MailOpenIcon color="#F8B951" style={{ margin: 0, padding: "5px" }} />
          {state}
        </StateContainer>
      );
    if (state === "fermé")
      return (
        <StateContainer>
          <SuccessIcon color="#6BC762" style={{ margin: 0, padding: "5px" }} />
          {state}
        </StateContainer>
      );
    if (state === "nouveau")
      return (
        <StateContainer>
          <MailCloseIcon color="#F1545B" style={{ margin: 0, padding: "5px" }} />
          {state}
        </StateContainer>
      );
  };

  return (
    <HeroContainer>
      <Container>
        <h4 style={{ marginLeft: "0.5rem" }}>Besoin d'aide&nbsp;?</h4>
        <div className="help-section">
          <div className="help-section-text" style={{ color: "#6B7280" }}>
            Vous souhaitez en savoir plus sur les phases de votre parcours volontaire ou sur le fonctionnement de votre espace&nbsp;?
            <br />
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
        <div className="help-section">
          <div className="help-section-text" style={{ color: "#6B7280" }}>
            Vous n'avez pas trouvé de réponse à votre demande ?<br />
            Contactez notre{" "}
            <strong>
              <NavLink className="link" to="/besoin-d-aide/ticket">
                service de support
              </NavLink>
            </strong>
            .
          </div>
          <div className="buttons">
            <InternalLink to="/besoin-d-aide/ticket">Contacter&nbsp;quelqu'un</InternalLink>
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
      <hr style={{ margin: "2rem" }} />
      <h4 style={{ marginLeft: "0.5rem" }}>Mes conversations en cours</h4>
      <List>
        <section className="ticket titles">
          <p>Nº demande</p>
          <p>Sujet</p>
          <p>Contact</p>
          <p>État</p>
          <p className="ticket-date">Dernière mise à jour</p>
        </section>
        {!userTickets ? <Loader /> : null}
        {userTickets?.length === 0 ? <div style={{ textAlign: "center", padding: "1rem", fontSize: "0.85rem" }}>Aucun ticket</div> : null}
        {userTickets
          ?.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          ?.map((ticket) => (
            <NavLink to={`/besoin-d-aide/ticket/${ticket.id}`} key={ticket.id} className="ticket">
              <p>{ticket.number}</p>
              <p>{ticket.title}</p>
              <p>{getLastContactName(ticket?.articles)}</p>
              <p>{displayState(ticketStateNameById(ticket.state_id))}</p>
              <p className="ticket-date">{dayjs(new Date(ticket.updated_at)).fromNow()}</p>
            </NavLink>
          ))}
      </List>
    </HeroContainer>
  );
};

const StateContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  .help-section {
    padding: 0.5rem;
    display: flex;
    justify-content: space-between;
    .buttons {
      margin: 1rem 0;
      flex: 1;
    }
  }
  .help-section-text {
    flex: 3;
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
    color: #fff;
    background: #463bad;
  }
`;
const InternalLink = styled(NavLink)`
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

const List = styled.div`
  background-color: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 0.5rem;
  overflow: hidden;
  .ticket {
    border-bottom: 1px solid #f1f1f1;
    color: black;
    padding: 1rem 1.5rem;
    display: grid;
    grid-template-columns: 1fr 2fr 1fr 1fr 1fr;
    grid-template-rows: 1fr;
    :not(:first-child):hover {
      background-color: #f1f1f1 !important;
    }
  }
  .ticket p {
    margin: 0;
    padding: 0.5rem;
  }
  .ticket-date {
    justify-self: end;
  }
  .titles {
    font-weight: bold;
  }
`;
