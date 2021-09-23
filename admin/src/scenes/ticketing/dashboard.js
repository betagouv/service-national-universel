import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { formatDistanceToNow } from "date-fns";

import { fr } from "date-fns/locale";
import api from "../../services/api";
import Loader from "../../components/Loader";
import Header from "./components/header";
import TicketTabs from "./components/ticketTabs";
import TicketMessage from "./components/ticketMessage";
import Infos from "./components/infos";

export default () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
      const fetchUser = async () => {
        setUser({
          firstName: "Kevin",
          lastName: "Lamy",
          email: "kevin.lamy@gmail.com",
          department: "Isère",
          cohesionCenter: "Lycée hôtelier de Dinard",
          cohesionDayStatus: "Validée",
          phase1Status: "Effectuée",
          phase2Status: "Validée",
          phase3Status: "En attente de réalisation",
        })
      };
      fetchUser();
  }, [selectedTicket]);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await api.get(`/user/${selectedTicket.userId}`);
  //       if (!response.ok) {
  //         setUser(null);
  //         return console.log(response);
  //       }
  //       setUser(response.data);
  //       console.log(response.data);
  //     } catch (error) {
  //       setUser(null);
  //       console.log(error);
  //     }
  //   };
  //   fetchUser();
  // }, [selectedTicket]);

  return (
    <HeroContainer>
      <Header />
      <section>
        <TicketTabs setSelectedTicket={setSelectedTicket}/>
        <TicketMessage />
        <Infos user={user}/>
      </section>
    </HeroContainer>
  );
};

export const HeroContainer = styled.div`
  flex: 1;
  padding: 1rem;
  section {
    display: flex;
  }
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
