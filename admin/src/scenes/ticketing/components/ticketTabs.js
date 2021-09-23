import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { formatDistanceToNow } from "date-fns";

import { fr } from "date-fns/locale";
import Loader from "../../../components/Loader";

import api from "../../../services/api";

const status = [
  {
    id: 1,
    name: "new",
  },
  {
    id: 2,
    name: "open",
  },
  {
    id: 3,
    name: "pending reminder",
  },
  {
    id: 4,
    name: "closed",
  },
  {
    id: 5,
    name: "merged",
  },
  {
    id: 6,
    name: "removed",
  },
  {
    id: 7,
    name: "pending close",
  },
];

export default ({ setTicket, ticket }) => {
  const [allOpen, setAllOpen] = useState(true);
  const [unread, setUnread] = useState(false);
  const [closed, setClosed] = useState(false);
  const [stateFilter, setStateFilter] = useState();

  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/support-center/ticket`);
      console.log({ data });
      setTickets(data);
      if (data.length) setTicket(data[0]);
    })();
  }, []);

  const getFrom = (ticket) => {
    if (!ticket.articles.length) return "";
    return ticket.articles[1].from;
  };

  const getDate = (ticket) => {
    return (ticket.created_at || "").slice(0, 10);
  };

  return (
    <HeroContainer>
      <List>
        <FilterContainer>
          <TabItem onClick={() => setStateFilter()} isActive={!stateFilter}>
            Tous
          </TabItem>
          <TabItem onClick={() => setStateFilter(1)} isActive={stateFilter === 1}>
            Non&nbsp;lus
          </TabItem>
          <TabItem onClick={() => setStateFilter(4)} isActive={stateFilter === 4}>
            Fermés
          </TabItem>
          <TabItem onClick={() => setStateFilter("other")} isActive={stateFilter === "other"}>
            X
          </TabItem>
        </FilterContainer>
        {!tickets ? <Loader /> : null}
        {tickets?.length === 0 ? <div style={{ textAlign: "center", padding: "1rem", fontSize: "0.85rem" }}>Aucun ticket</div> : null}
        {tickets
          ?.filter((ticket) => {
            return !stateFilter || ticket?.state_id === stateFilter;
          })
          ?.map((ticket) => (
            <div key={ticket.id} className="ticket" onClick={() => setTicket(ticket)}>
              <div className="ticket-subject">
                <p>{getFrom(ticket)}</p>
                <p>{getDate(ticket)}</p>
              </div>
              <p className="ticket-text">{ticket.title}</p>
            </div>
          ))}
      </List>
    </HeroContainer>
  );
};

const FilterContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 0.5fr;
  grid-template-rows: 1fr;
  font-weight: bold;
  padding: 0;
`;

const TabItem = styled.div`
  padding: 0.75rem;
  position: relative;
  font-size: 16px;
  color: #979797;
  cursor: pointer;
  text-align: center;
  :hover {
    color: #aaa;
    &:after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background-color: #aaa;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
  }

  ${(props) =>
    props.isActive &&
    `
    color: #5245CC;
    font-weight: bold;

    &:after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background-color: #5245CC;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
  `}
`;

export const HeroContainer = styled.div`
  flex: 1;
  background-color: white;
  max-width: 380px;
  min-width: 380px;
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
    padding: 0;
  }
`;
