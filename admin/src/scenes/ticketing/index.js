import React, { useEffect, useState } from "react";
import styled from "styled-components";
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
