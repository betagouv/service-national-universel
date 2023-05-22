import React from "react";
import styled from "styled-components";

import tools from "../../assets/tools.png";

export default function SupportCenterMaintenance() {
  return (
    <HeroContainer>
      <img src={tools} />
      <h5>Votre centre d&apos;aide est en cours de maintenance technique. ⚙️</h5>
      <h5>
        Pour toute demande, merci de nous contacter par mail à <a href="mailto:contact@snu.gouv.fr">contact@snu.gouv.fr</a>
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
