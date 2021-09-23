import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

export default () => {
  return (
    <HeroContainer>
      <div><p>new tickets</p></div>
      <div><p>opened tickets</p></div>
      <div><p>closed tickets</p></div>
    </HeroContainer>
  );
};

export const HeroContainer = styled.div`
  flex: 1;
  padding: 1rem;
  display: flex;
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;
