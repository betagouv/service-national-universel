import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";

import Loader from "../../../components/Loader";
import { formatStringDate, ROLES } from "../../../utils";
import { ticketStateIdByName } from "../../../utils/zammad";

import api from "../../../services/api";

export default ({ setTicket, selectedTicket }) => {
  const [stateFilter, setStateFilter] = useState(ticketStateIdByName("nouveau"));
  const [tickets, setTickets] = useState(null);
  const user = useSelector((state) => state.Auth.user);

  const getAlltickets = async () => {
    const { data } = await api.get(`/support-center/ticket?withArticles=true`);
    setTickets(data);
  };

  const getTickets = async ({ region, department }) => {
    const tags = [];
    if (region) {
      tags.push(`AGENT_Référent_Région`);
      tags.push(`REGION_${region}`);
    }
    if (department) {
      tags.push(`AGENT_Référent_Département`);
      tags.push(`DEPARTEMENT_${department}`);
    }
    const { data } = await api.post(`/support-center/ticket/search-by-tags?withArticles=true`, { tags });
    setTickets(data);
  };

  useEffect(() => {
    let ticketsFromZammad = [];
    if (user.role === ROLES.ADMIN) ticketsFromZammad = getAlltickets();
    else if (user.role === ROLES.REFERENT_DEPARTMENT) ticketsFromZammad = getTickets({ department: user.department });
    else if (user.role === ROLES.REFERENT_REGION) ticketsFromZammad = getTickets({ department: user.department });
  }, []);

  useEffect(() => {
    const displayedTickets = tickets?.filter((ticket) => !stateFilter || ticket?.state_id === stateFilter);
    if (displayedTickets?.length) setTicket(displayedTickets[0]);
    else setTicket(null);
  }, [stateFilter]);

  const getFrom = (ticket) => {
    if (!ticket.articles?.length) return "";
    return ticket.articles[0]?.from;
  };

  const getDate = (ticket) => {
    return (ticket.created_at || "").slice(0, 10);
  };

  return (
    <HeroContainer>
      <List>
        <FilterContainer>
          <TabItem onClick={() => setStateFilter(ticketStateIdByName("nouveau"))} isActive={stateFilter === ticketStateIdByName("nouveau")}>
            Non&nbsp;lu(s)
          </TabItem>
          <TabItem onClick={() => setStateFilter(ticketStateIdByName("ouvert"))} isActive={stateFilter === ticketStateIdByName("ouvert")}>
            Ouvert(s)
          </TabItem>
          <TabItem onClick={() => setStateFilter(ticketStateIdByName("fermé"))} isActive={stateFilter === ticketStateIdByName("fermé")}>
            Fermé(s)
          </TabItem>
          <TabItem onClick={() => setStateFilter()} isActive={!stateFilter}>
            Tous
          </TabItem>
          {/* todo other filters */}
          {/* <TabItem onClick={() => setStateFilter("other")} isActive={stateFilter === "other"}>
            X
          </TabItem> */}
        </FilterContainer>
        {!tickets ? (
          <Loader />
        ) : (
          <>
            {tickets?.filter((ticket) => !stateFilter || ticket?.state_id === stateFilter)?.length === 0 ? (
              <div style={{ textAlign: "center", padding: "1rem", fontSize: "0.85rem" }}>Aucun ticket</div>
            ) : null}
            {tickets
              ?.filter((ticket) => !stateFilter || ticket?.state_id === stateFilter)
              ?.sort((a, b) => {
                return new Date(b.updated_at) - new Date(a.updated_at);
              })
              ?.map((ticket) => (
                <TicketContainer key={ticket.id} active={ticket.id === selectedTicket?.id} className="ticket" onClick={() => setTicket(ticket)}>
                  <TicketHeader>
                    <TicketFrom>{getFrom(ticket)}</TicketFrom>
                    <TicketDate>{formatStringDate(getDate(ticket))}</TicketDate>
                  </TicketHeader>
                  <TicketPreview>{ticket.title}</TicketPreview>
                </TicketContainer>
              ))}
          </>
        )}
      </List>
    </HeroContainer>
  );
};

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;
const TicketFrom = styled.div`
  color: #242526;
  font-weight: 700;
`;
const TicketDate = styled.div`
  color: #979797;
  font-weight: 400;
  font-size: 0.8rem;
`;
const TicketPreview = styled.div`
  color: #242526;
  font-size: 0.8rem;
  font-weight: 400;
`;

const FilterContainer = styled.div`
  display: flex;
  padding: 0;
  border-bottom: 1px solid #f1f1f1;
`;

const TabItem = styled.div`
  flex: 1;
  padding: 0.75rem;
  position: relative;
  font-size: 0.8rem;
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
  border-top: 1px solid #e4e4e7;
  border-bottom: 1px solid #e4e4e7;
  overflow: scroll;
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

export const Link = styled.div`
  :hover {
    background-color: red;
  }
`;

const TicketContainer = styled.div`
  cursor: pointer;
  border-bottom: 1px solid #f1f1f1;
  color: black;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  :not(:first-child):hover {
    background-color: #f8f8f8 !important;
  }
  ${(props) => props.active && `background-color: #5245CC0C !important;`}
`;

const List = styled.div`
  background-color: #fff;
`;
