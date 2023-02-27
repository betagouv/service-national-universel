import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";

import tools from "../../assets/tools.png";

export default function SupportCenterMaintenance() {
  const young = useSelector((state) => state.Auth.young);
  return (
    <HeroContainer>
      {young && (
        <NavLink style={{ color: "#32257F", fontWeight: "bold", marginBottom: "1rem" }} to="/">
          {" "}
          <svg width="8" height="11" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.42367 0L0.423279 4.00716L4.42367 8.01432L5.41483 7.02148L2.4056 4.00716L5.41483 0.992838L4.42367 0Z" fill="#32257F" />
          </svg>{" "}
          Retour à mon espace
        </NavLink>
      )}
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
