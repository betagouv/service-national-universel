import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { formatDistanceToNow } from "date-fns";

import { HeroContainer } from "../../components/Content";
import { fr } from "date-fns/locale";
import API from "../../services/api";
import Loader from "../../components/Loader";
import { ticketStateNameById } from "../../utils";

const articles = [
  {
    title: "Je cherche une mission",
    body: `Depuis l'onglet "Mission d'intérêt général", cliquez sur la rubrique...`,
    url: "https://support.snu.gouv.fr/help/fr-fr/13-phase-2-mission-d-interet-general/33-je-cherche-une-mission-mig",
  },
  {
    title: "Je modifie mon identifiant e-mail",
    body: `Connectez vous à votre espace volontaire, accédez à "Mon profil"...`,
    url: "https://support.snu.gouv.fr/help/fr-fr/10-mon-compte/51-je-modifie-mon-identifiant-email",
  },
  {
    title: "Je consulte mes missions réalisées",
    body: `Les missions réalisées correspondent aux missions que vous avez déjà...`,
    url: "https://support.snu.gouv.fr/help/fr-fr/13-phase-2-mission-d-interet-general/38-je-consulte-mes-missions-realisees",
  },
];

export default () => {
  const [userTickets, setUserTickets] = useState(null);
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await API.get("/support-center/ticket");
        if (!response.ok) return console.log(response);
        setUserTickets(response.data);
      } catch (error) {
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
          <div style={{ color: "#6B7280" }}>
            Vous souhaitez en savoir plus sur les phases de votre parcours volontaire ou sur le fonctionnement de votre espace&nbsp;?
            <br />
            N'hésitez pas à consulter notre{" "}
            <strong>
              <a href="https://support.snu.gouv.fr/help/fr-fr/3-volontaire" style={{ color: "#6B7280" }} target="_blank" rel="noopener noreferrer">
                base de connaissance
              </a>
            </strong>
            &nbsp;!
          </div>
          <div className="buttons">
            <LinkButton href="https://support.snu.gouv.fr/help/fr-fr/3-volontaire" target="_blank" rel="noopener noreferrer">
              Trouver ma réponse
            </LinkButton>
          </div>

          <div style={{ color: "#6B7280" }}>
            Vous n'avez pas trouvé de réponse à votre demande ?<br />
            Contactez notre <strong>service de support</strong>.
          </div>
          <div className="buttons">
            <InternalLink to="/besoin-d-aide/ticket">Contacter quelqu'un</InternalLink>
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
      <h4 style={{ marginLeft: "0.5rem" }}>Mes conversations en cours</h4>
      <List>
        <section className="ticket titles">
          <p>Numéro du ticket</p>
          <p>Sujet</p>
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
              <p>{ticketStateNameById(ticket.state_id)}</p>
              <p className="ticket-date">il y a {formatDistanceToNow(new Date(ticket.updated_at), { locale: fr })}</p>
            </NavLink>
          ))}
      </List>
    </HeroContainer>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .help-section {
    max-width: 500px;
    text-align: center;
    margin: 0 0.5rem;
    .buttons {
      margin: 1rem 0;
    }
  }
  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    margin: 0.5rem 1.5rem;
    .help-section {
      text-align: left;
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
  @media (max-width: 1024px) {
    margin: 0.5rem;
  }

  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: 0.5rem;
  overflow: hidden;
  .ticket {
    border-bottom: 1px solid #f1f1f1;
    color: black;
    padding: 1rem 1.5rem;
    display: grid;
    grid-template-columns: 1fr 2fr 1fr 1fr;
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
