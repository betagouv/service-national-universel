import React from "react";
import styled from "styled-components";

import tools from "../../assets/tools.png";

export default function SupportCenterMaintenance() {
  return (
    <HeroContainer>
      <img src={tools} />
      <h5>La boîte de réception est actuellement en maintenance pour 24h00.</h5>
      <h5>Les formulaires de contacts ont également été bloqués. Vous aurez accès à toutes les demandes des volontaires reçues avant le 13 septembre 11h00 dès demain.</h5>
      <h5>
        Veuillez nous excuser de la gène occasionnée. L’équipe support reste disponible à l’adresse : <a href="mailto:contact@snu.gouv.fr">contact@snu.gouv.fr</a>
      </h5>
    </HeroContainer>
  );
}

export const HeroContainer = styled.div`
  flex: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
  img {
    width: 200px;
    margin-bottom: 2rem;
  }
  h5 {
    margin: 1rem;
    text-align: center;
  }
  a {
    color: #382f79;
  }
`;
