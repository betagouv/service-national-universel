import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { ROLES } from "../../utils";

import User from "./user";

export default ({ onClickBurger }) => {
  const { user } = useSelector((state) => state.Auth);
  if (!user) return <div />;

  function getName() {
    if (user.role === ROLES.ADMIN) return "Espace modérateur";
    if (user.role === ROLES.REFERENT_DEPARTMENT) return "ESPACE RÉFÉRENT DÉPARTEMENTAL";
    if (user.role === ROLES.REFERENT_REGION) return "ESPACE RÉFÉRENT REGIONAL";
    if (user.role === ROLES.RESPONSIBLE) return "Espace responsable";
    if (user.role === ROLES.SUPERVISOR) return "Espace superviseur";
    return "";
  }

  return (
    <Header>
      <Burger onClick={onClickBurger} src={require("../../assets/burger.svg")} />
      <Title>{getName()}</Title>
      <div style={{ display: "flex", alignItems: "center" }}>
        <User />
      </div>
    </Header>
  );
};

const Header = styled.div`
  background-color: #fff;
  padding-right: 20px;
  width: 100%;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  @media (max-width: 768px) {
    justify-content: space-between;
  }
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.05);
  position: sticky;
  left: 0;
  top: 0;
  z-index: 10;
  padding: 1rem;
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

const Title = styled.div`
  font-size: 1rem;
  font-weight: 700;
  @media (min-width: 768px) {
    display: none;
  }
`;
