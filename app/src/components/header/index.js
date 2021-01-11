import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import User from "./user";

export default () => {
  return (
    <Header>
      <Logos>
        <Link to="/">
          <img src={require("../../assets/small-logo.svg")} height={16} />
        </Link>
        <h1>
          <Link to="/">
            <img src={require("../../assets/logo-snu.png")} height={36} />
            <span className="mobileHide">SERVICE NATIONAL UNIVERSEL</span>
          </Link>
        </h1>
      </Logos>
      <User />
    </Header>
  );
};

const Header = styled.div`
  padding: 15px 15px 5px;
  background-color: #fff;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  position: sticky;
  left: 0;
  top: 0;
  z-index: 20;
  @media (max-width: 768px) {
    .mobileHide {
      display: none;
    }
    position: relative;
  }
`;

const Logos = styled.div`
  display: flex;
  align-items: center;
  img {
    vertical-align: top;
  }
  h1 {
    margin-left: 30px;
    margin-bottom: 0;
    font-weight: 700;
    a {
      display: inline-flex;
      align-items: center;
      color: #161e2e;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      text-decoration: none;
    }
    img {
      margin-right: 10px;
    }
  }
`;
