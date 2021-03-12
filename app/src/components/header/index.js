import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import User from "./user";

export default ({ step, onClickBurger }) => {
  return (
    <>
      <HeaderNav>
        <Burger onClick={onClickBurger} src={require("../../assets/burger.svg")} />
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
    h1 {
      color: #6b7280;
      font-size: 1.2rem;
      font-weight: 500;
      margin-bottom: 0;
    }
    padding: 0.5rem 0.5rem;
    text-align: center;
    .mobileHide {
      display: none;
    }
  }
`;

const Burger = styled.img`
  display: none;
  @media (max-width: 768px) {
    display: block;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    object-fit: contain;
    cursor: pointer;
    svg {
      color: #f00;
    }
  }
`;
