import React, { useState } from "react";
import styled from "styled-components";

export default ({ value, onChange }) => {
  return (
    <Nav>
      <NavItem onClick={() => onChange("profil")} active={true} current={value === "profile"}>
        <div className="number">1</div>
        <div className="title">Profil</div>
        <div className="subtitle">Je complète les informations de mon profil</div>
      </NavItem>
      <NavItem onClick={() => onChange("structure")} active={value === "structure"} current={value === "structure"}>
        <div className="number">2</div>
        <div className="title">Structure</div>
        <div className="subtitle">J'enregistre ma structure en tant que responsable</div>
      </NavItem>
      <NavItem onClick={() => onChange("address")} active={value === "address"} current={value === "address"}>
        <div className="number">3</div>
        <div className="title">Adresse</div>
        <div className="subtitle">J'enregistre le lieu de mon établissement</div>
      </NavItem>
    </Nav>
  );
};

const Nav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
`;

const NavItem = styled.div`
  text-align: center;
  padding: 15px;
  position: relative;
  cursor: pointer;
  flex: 1;
  .number {
    height: 24px;
    width: 24px;
    border-radius: 50%;
    background-color: #fff;
    font-size: 14px;
    line-height: 1.5em;
    font-weight: 500;
    text-align: center;
    margin: 0 auto 5px;
    position: relative;
    z-index: 2;
    display: block;
    border: 2px solid #6a6f85;
    color: #6a6f85;

    ${({ current }) =>
      current &&
      `border: 2px solid #3182ce;
      color: #3182ce;    
    `}

    ${({ active }) =>
      active &&
      `border: 2px solid #303133;
      color: #303133;    
    `}
  }

  :not(:first-child)::after {
    content: "";
    display: block;
    width: 100%;
    height: 2px;
    background-color: #6a6f85;
    position: absolute;
    right: 50%;
    top: 27px;
    z-index: 1;

    ${({ current, active }) => current && `background-color: #3182ce`};
    ${({ active }) => active && `background-color: #303133`};
  }
  .title {
    font-size: 16px;
    margin-bottom: 5px;

    color: #6a6f85;
    ${({ current, active }) => (current || active) && `color: #3182ce`};
    ${({ active }) => active && `color: #303133`};

    font-weight: ${({ active }) => (active ? 600 : 400)};
  }
  .subtitle {
    font-size: 12px;
    color: #6a6f85;

    ${({ current, active }) => (current || active) && `color: #3182ce`};
    ${({ active }) => active && `color: #303133`};
  }
`;
