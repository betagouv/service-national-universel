import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { formatDistanceToNow } from "date-fns";

import { fr } from "date-fns/locale";
import api from "../../services/api";
import Loader from "../../components/Loader";

const articles = [
  {
    title: "Livret d'accueil Référent",
    body: "Découvrez en quelques minutes les éléments de prise en main...",
    url: "https://support.selego.co/help/fr-fr/1-referent/24-livret-d-accueil-referent",
  },
  {
    title: "Je ne reçois pas les liens pour valider les contrats d'engagement",
    body: `Comment fonctionne la validation d'un contrat ? La plateforme envoie...`,
    url: "https://support.selego.co/help/fr-fr/6-phase-2-mission-d-interet-general/14-je-ne-recois-pas-les-liens-pour-valider-les-contrats-d-engagement",
  },
  {
    title: "J'invite un nouvel utilisateur (référent, chef de centre)",
    body: `Cette action vous permet d'inviter un nouvel utilisateur...`,
    url: "https://support.selego.co/help/fr-fr/4-mon-compte/10-j-invite-un-nouvel-utilisateur-referent-chef-de-centre",
  },
];

export default () => {
  const [userTickets, setUserTickets] = useState(null);
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get("/support-center/ticket");
        if (!response.ok) {
          setUserTickets([]);
          return console.log(response);
        }
        setUserTickets(response.data);
        console.log(response.data);
      } catch (error) {
        setUserTickets([]);
        console.log(error);
      }
    };
    fetchTickets();
  }, []);

  return (
    <HeroContainer>
      <Container>
        <section className="help-section">
          <h2>Besoin d'aide&nbsp;?</h2>
          <p style={{ color: "#6B7280" }}>
            Vous rencontrez une difficulté, avez besoin d'assistance pour réaliser une action ou avez besoin d'informations supplémentaires sur la plateforme&nbsp;? N'hésitez pas à
            consulter notre{" "}
            <strong>
              <a href="https://support.selego.co/help/fr-fr/1-referent" style={{ color: "#6B7280" }} target="_blank" rel="noopener noreferrer">
                base de connaissance
              </a>
            </strong>
            &nbsp;!
            <br /> Vous avez un problème technique ? Contactez notre service de support.
          </p>
          <div className="buttons">
            <LinkButton href="https://support.selego.co/help/fr-fr/1-referent" target="_blank" rel="noopener noreferrer">
              Base de connaissance
            </LinkButton>
            <InternalLink to="/ticket">Contacter quelqu'un</InternalLink>
          </div>
        </section>
        <Card>
          <h4 style={{ marginLeft: "0.5rem" }}>Quelques articles pour vous aider&nbsp;:</h4>
          <div className="division">
            {articles.map((article) => (
              <div className="block" key={article.url} onClick={() => window.open(article.url)}>
                <h6>{article.title}</h6>
                <p>{article.body}</p>
                <p>
                  <a className="block-link" href={article.url} target="_blank">
                    Lire la suite
                  </a>
                </p>
              </div>
            ))}
          </div>
        </Card>
      </Container>
      <List>
        <section className="ticket titles">
          <p>Numéro du ticket</p>
          <p>Sujet</p>
          <p className="ticket-date">Dernière mise à jour</p>
        </section>
        {!userTickets ? <Loader /> : null}
        {userTickets?.length === 0 ? <div style={{ textAlign: "center", padding: "1rem", fontSize: "0.85rem" }}>Aucun ticket</div> : null}
        {userTickets
          ?.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          ?.map((ticket) => (
            <NavLink to={`/ticket/${ticket.id}`} key={ticket.id} className="ticket">
              <p>{ticket.id}</p>
              <p>{ticket.title}</p>
              <p className="ticket-date">il y a {formatDistanceToNow(new Date(ticket.updated_at), { locale: fr })}</p>
            </NavLink>
          ))}
      </List>
    </HeroContainer>
  );
};

export const HeroContainer = styled.div`
  flex: 1;
  padding: 1rem;
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

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
  .buttons {
    display: grid;
    grid-template-rows: 1fr 1fr;
    justify-content: center;
    text-align: center;
  }
  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    margin: 0.5rem 1.5rem;
    .help-section {
      text-align: left;
    }
    .buttons {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr;
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

const Card = styled.div`
  margin-top: 2rem;
  min-width: 330px;
  .division {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .block {
    background-color: #fff;
    display: flex;
    flex-direction: column;
    padding: 1.3rem;
    margin: 0.5rem;
    box-shadow: 0 0 15px -3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    :hover {
      box-shadow: 0 0 15px 3px rgba(0, 0, 0, 0.2);
    }
    border-radius: 0.5rem;
  }
  .block p,
  .block a {
    margin: 0;
    font-size: 0.9rem;
  }
  @media (min-width: 1024px) {
    margin-top: 0;
  }
`;

const List = styled.div`
  background-color: #fff;
  margin: 2rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 0.5rem;
  overflow: hidden;
  .ticket {
    border-bottom: 1px solid #f1f1f1;
    color: black;
    padding: 1rem 1.5rem;
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-template-rows: 1fr;
    :not(:first-child):hover {
      background-color: #f1f1f1 !important;
    }
  }
  .ticket p {
    margin: 0;
  }
  .ticket-date {
    justify-self: end;
  }
  .titles {
    font-weight: bold;
  }
`;
