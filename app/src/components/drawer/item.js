import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

import { translate, PHASE_STATUS_COLOR, translatePhase1, translatePhase2 } from "../../utils";

export default function Item({ title, subtitle, to, status, handleClick, disabled, children, open, phase }) {
  const [color, setColor] = useState();
  const [strokeColor, setStrokeColor] = useState();
  const [icon, setIcon] = useState();

  const translator = (el) => {
    if (to === "/phase1") {
      return translatePhase1(el);
    } else if (to === "/phase2") {
      return translatePhase2(el);
    } else {
      return translate(el);
    }
  };

  useEffect(() => {
    let c = PHASE_STATUS_COLOR[status];
    setColor(c || "#8da2fb");
    setStrokeColor(c ? "#fff" : "#42389d");
    if (phase === "1")
      setIcon(
        "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      );
    if (phase === "2") setIcon("M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z");
    if (phase === "3") setIcon("M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z");
  }, [status]);

  return (
    <ItemContainer color={color}>
      <NavLink to={to} onClick={handleClick} className={disabled ? "disabled" : ""}>
        <Icon color={color}>
          <svg fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke={strokeColor} d={icon}></path>
          </svg>
        </Icon>
        <div>
          {title}
          <span>
            {subtitle} • {translator(status)}
          </span>
        </div>
      </NavLink>
      {open ? children : null}
    </ItemContainer>
  );
}

const Icon = styled.div`
  background-color: ${({ color }) => color};
  z-index: 999;
  height: 32px;
  width: 32px;
  min-width: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  svg {
    height: 65%;
  }
`;

const ItemContainer = styled.li`
  background-size: 20px;
  padding-left: 0;
  margin-bottom: 15px;
  width: 100%;
  > a {
    text-transform: uppercase;
    color: #fff;
    display: block;
    font-size: 12px;
    padding: 15px 10px 15px 35px;
    @media (max-width: 1400px) {
      padding: 15px 10px 15px 20px;
    }
    font-weight: 600;
    position: relative;
    display: flex;
  }
  span {
    display: block;
    color: #b4c6fc;
    font-size: 12px;
    font-weight: 400;
    text-transform: none;
    text-align: left;
  }
  /* vertical line between */
  :not(:last-child) {
    position: relative;
    ::after {
      content: "";
      display: block;
      height: 110%;
      width: 2px;
      background-color: ${({ color }) => color || "#8da2fb"};
      position: absolute;
      left: 50px;
      top: 40px;
      z-index: 50;
      @media (max-width: 1400px) {
        left: 35px;
      }
    }
  }
`;
