import React, { useEffect, useState } from "react";
import styled from "styled-components";

import Header from "./components/header";
import TicketTabs from "./components/ticketTabs";
import TicketMessage from "./components/ticketMessage";
import Infos from "./components/infos";

export default () => {
  const [ticket, setTicket] = useState(null);

  return (
    <HeroContainer>
      <Header />
      <section>
        <TicketTabs setTicket={setTicket} />
        <TicketMessage ticketId={ticket?.id} />
        <Infos />
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
