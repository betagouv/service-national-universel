import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

export default () => {
  return (
    <HeroContainer>
      <h4>Informations volontaire</h4>
      <div>
        <p>Nom complet :</p>
        <p>Kevin Lamy</p>
      </div>
      <div>
        <p>E-mail :</p>
        <p>kevin.lamy@gmail.com</p>
      </div>
      <div>
        <p>Département :</p>
        <p>Isère</p>
      </div>
    </HeroContainer>
  );
};

export const HeroContainer = styled.div`
  flex: 1;
  padding: 1rem;
  background-color: #fff;
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;
