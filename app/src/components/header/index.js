import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import User from "./user";

export default ({ step }) => {
  return (
    <>
      <HeaderNav>
        <Link to="/">
          <h1>Mon espace volontaire</h1>
        </Link>
        <User />
      </HeaderNav>
    </>
  );
};

const HeaderNav = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  margin-bottom: 1rem;
  background-color: #fff;
  height: 6rem;
  justify-content: space-between;
  h1 {
    color: #6b7280;
    font-size: 1.5rem;
    font-weight: 500;
    margin-bottom: 0;
  }
  @media (max-width: 768px) {
    .mobileHide {
      display: none;
    }
  }
`;
