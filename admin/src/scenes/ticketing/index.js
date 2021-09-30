import React, { useEffect, useState } from "react";
import styled from "styled-components";

import Header from "./components/header";
import TicketTabs from "./components/ticketTabs";
import TicketMessage from "./components/ticketMessage";
import Infos from "./components/ticketInfos";

export default () => {
  const [ticket, setTicket] = useState(null);

  return (
    <HeroContainer>
      <Header />
      <section>
        <TicketTabs setTicket={setTicket} selectedTicket={ticket} />
        <TicketMessage ticket={ticket} />
        <Infos ticket={ticket} />
      </section>
    </HeroContainer>
  );
};

export const HeroContainer = styled.div`
  height: 900px;
  section {
    display: flex;
    height: 92.5%;
  }
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;
