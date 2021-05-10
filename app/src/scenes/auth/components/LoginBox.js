import React from "react";
import styled from "styled-components";

export default ({ children }) => {
  return (
    <AuthWrapper>
      <LoginBox>{children}</LoginBox>
    </AuthWrapper>
  );
};

const AuthWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-grow: 2;
  position: relative;
  background: url(${require("../../../assets/login.jpg")}) center no-repeat;
  background-size: cover;
  ::after {
    content: "";
    display: block;
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: rgba(63, 54, 148, 0.95);
    z-index: 1;
  }
  > * {
    position: relative;
    z-index: 2;
  }
`;

const LoginBox = styled.div`
  max-width: 450px;
  width: 100%;
  padding: 40px 30px 20px;
  border-radius: 8px;
  margin: auto;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  @media (max-width: 768px) {
    border-radius: 0;
    margin: 0;
    max-width: 100%;
  }
`;
