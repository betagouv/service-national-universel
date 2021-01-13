import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import User from "./user";

export default () => {
  const { user } = useSelector((state) => state.Auth);
  if (!user) return <div />;

  return (
    <Header>
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* <IconLink to="#" icon={require("../../assets/messages.svg")} /> */}
        {/* <IconLink to="#" icon={require("../../assets/notification.svg")} /> */}
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
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.05);
  position: sticky;
  left: 0;
  top: 0;
  z-index: 20;
`;

const Logo = styled.h1`
  background: #372f78;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
  width: 250px;
  margin-bottom: 0;
  padding: 15px 20px 5px;
  a {
    display: inline-flex;
    align-items: center;
    color: #161e2e;
    font-size: 13px;
    font-weight: 500;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    text-decoration: none;
  }
  img {
    margin-right: 25px;
    vertical-align: top;
  }
`;

const IconLink = styled(Link)`
  background: url(${({ icon }) => icon}) center no-repeat;
  background-size: contain;
  height: 25px;
  width: 25px;
  display: block;
  margin-right: 20px;
`;
