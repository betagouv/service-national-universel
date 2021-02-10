import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

import { translate, PHASE_STATUS_COLOR, PHASE_STATUS } from "../../utils";

export default ({ title, subtitle, to, status, handleClick, disabled, children, open }) => {
  const [color, setColor] = useState("#8da2fb");
  const [strokeColor, setStrokeColor] = useState("#42389d");
  useEffect(() => {
    console.log(status);
    if (status === PHASE_STATUS.VALIDATED || status === PHASE_STATUS.CANCEL) {
      setColor(PHASE_STATUS_COLOR[status]);
      setStrokeColor("#fff");
    }
  }, [status]);

  return (
    <Item color={color}>
      <NavLink to={to} onClick={handleClick} className={disabled ? "disabled" : ""}>
        <Icon color={color}>
          <svg fill="none" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              stroke={strokeColor}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            ></path>
          </svg>
        </Icon>
        <div>
          {title}
          <span>
            {subtitle} • {translate(status)}
          </span>
        </div>
      </NavLink>
      {open ? children : null}
    </Item>
  );
};

const Icon = styled.div`
  background-color: ${({ color }) => color};
  z-index: 999;
  height: 32px;
  width: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  svg {
    height: 65%;
  }
`;

const Item = styled.li`
  background-size: 20px;
  padding-left: 0;
  margin-bottom: 15px;
  > a {
    text-transform: uppercase;
    color: #fff;
    display: block;
    font-size: 12px;
    padding: 15px 10px 15px 35px;
    @media (max-width: 1400px) {
      padding: 15px 10px 15px 20px;
    }
    height: 70px;
    font-weight: 600;
    position: relative;
    display: flex;
    align-items: center;
  }
  span {
    display: block;
    color: #b4c6fc;
    font-size: 12px;
    font-weight: 400;
    text-transform: capitalize;
  }
  /* vertical line between */
  :not(:last-child) {
    position: relative;
    ::after {
      content: "";
      display: block;
      height: 100%;
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
