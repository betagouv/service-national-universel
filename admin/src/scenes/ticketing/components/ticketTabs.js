import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { formatDistanceToNow } from "date-fns";

import { fr } from "date-fns/locale";
import Loader from "../../../components/Loader";

import api from "../../../services/api";

export default ({ setSelectedTicket }) => {
  const [allOpen, setAllOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const [closed, setClosed] = useState(false);

  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/support-center/ticket`);
      setTickets(data);
    })();
  }, []);

  const getFrom = (ticket) => {
    if (!ticket.articles.length) return "";
    return ticket.articles[1].from;
  };

  const getDate = (ticket) => {
    console.log("ticket", ticket);
    return (ticket.created_at || "").slice(0, 10);
  };

  return (
    <HeroContainer>
      <List>
        <section className="ticket titles">
          <div
            onClick={() => {
              setAllOpen(true);
              setClosed(false);
              setUnread(false);
            }}
            className={allOpen ? "active" : ""}
          >
            <p>Tous</p>
          </div>
          <div
            onClick={() => {
              setUnread(true);
              setAllOpen(false);
              setClosed(false);
            }}
            className={unread ? "active" : ""}
          >
            <p>Non lus</p>
          </div>
          <div
            onClick={() => {
              setUnread(false);
              setAllOpen(false);
              setClosed(true);
            }}
            className={closed ? "active" : ""}
          >
            <p>Fermés</p>
          </div>
        </section>
        {!tickets ? <Loader /> : null}
        {tickets?.length === 0 ? <div style={{ textAlign: "center", padding: "1rem", fontSize: "0.85rem" }}>Aucun ticket</div> : null}
        {tickets?.map((ticket) => (
          <Link key={ticket.id} className="ticket">
            <div className="ticket-subject">
              <p>{getFrom(ticket)}</p>
              <p>{getDate(ticket)}</p>
            </div>
            <p className="ticket-text">{ticket.title}</p>
          </Link>
        ))}
      </List>
    </HeroContainer>
  );
};

export const HeroContainer = styled.div`
  flex: 1;
  padding: 1rem;
  max-width: 380px;
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

export const Link = styled.div`
  :hover {
    background-color: red;
  }
`;

const List = styled.div`
  background-color: #fff;
  overflow: hidden;
  .active {
    color: blue;
  }
  .ticket {
    cursor: pointer;
    border-bottom: 1px solid #f1f1f1;
    color: black;
    padding: 1rem 1.5rem;
    display: flex;
    flex-direction: column;
    :not(:first-child):hover {
      background-color: #f1f1f1 !important;
    }
  }
  .ticket p {
    margin: 0;
  }
  .ticket-subject {
    display: flex;
    justify-content: space-between;
  }
  .ticket-text {
    color: gray;
  }
  .titles {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 1fr;
    font-weight: bold;
  }
`;
