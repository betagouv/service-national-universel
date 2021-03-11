import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";

import User from "./user";

export default () => {
  const { user } = useSelector((state) => state.Auth);
  if (!user) return <div />;

  return (
    <Header>
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
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.05);
  position: sticky;
  left: 0;
  top: 0;
  z-index: 20;
`;
