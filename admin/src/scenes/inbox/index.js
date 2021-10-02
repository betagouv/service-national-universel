import React, { useState } from "react";
import styled from "styled-components";

import Header from "./components/header";
import TicketTabs from "./components/ticketTabs";
import TicketMessage from "./components/ticketMessage";
import Infos from "./components/ticketInfos";
import { environment } from "../../config";

export default () => {
  if (environment === "production") return <div />;
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
  height: calc(87vh + 3px);
  > section {
    display: flex;
    height: 92.5%;
  }
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;
