import React from "react";
import styled from "styled-components";

export const Hero = ({ children, ...props }) => <HeroStyle {...props}>{children}</HeroStyle>;

const HeroStyle = styled.div`
  border-radius: 0.5rem;
  @media (max-width: 768px) {
    border-radius: 0;
  }
  margin: 0 auto;
  max-width: 80rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  background-color: #fff;

  .content {
    width: 65%;
    @media (max-width: 768px) {
      width: 100%;
    }
    padding: 60px 30px 60px 50px;
    position: relative;
    background-color: #fff;
    > * {
      position: relative;
      z-index: 2;
    }
  }
  h1 {
    font-size: 3rem;
    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 500;
    line-height: 1;
  }
  h2 {
    font-size: 1.5rem;
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    color: #161e2e;
    margin-bottom: 20px;
    font-weight: 500;
    line-height: 1;
  }
  p {
    color: #6b7280;
    font-size: 1.25rem;
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    font-weight: 400;
    display: -webkit-box;
    overflow: hidden;
    a {
      font-size: 1rem;
      color: #5949d0;
      :hover {
        text-decoration: underline;
      }
    }
  }
  .thumb {
    min-height: 400px;
    background: url(${require("../assets/phase3.jpg")}) no-repeat center;
    background-size: cover;
    flex: 1;
    -webkit-clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
    clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
  }
`;

export const HeroContainer = styled.div`
  flex: 1;
  padding: 1rem;
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;

export const Content = styled.div`
  margin-top: ${({ showAlert }) => (showAlert ? "2rem" : "")};
  width: 50%;
  padding: 60px 30px 60px 50px;
  @media (max-width: 768px) {
    width: 100%;
    padding: 30px 15px 30px 15px;
  }
  position: relative;
  background-color: #fff;
  > * {
    position: relative;
    z-index: 2;
  }
  .icon {
    margin-right: 1rem;
    svg {
      width: 1.5rem;
      stroke: #5145cd;
    }
  }
`;

export const Alert = ({ children, ...props }) => <AlertStyle {...props}>{children}</AlertStyle>;

const AlertStyle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ color }) => (color ? color : "#5145cd")};
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  padding: 10px 20px;
  position: absolute;
  z-index: 10;
  width: 100%;
  .text {
    margin: 0 20px;
    color: #fff;
    strong {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 3px;
    }
  }
  img {
    position: absolute;
    right: 0;
    margin-right: 1rem;
    cursor: pointer;
  }
`;

export const Separator = styled.hr`
  margin: 2.5rem 0;
  height: 1px;
  border-style: none;
  background-color: #e5e7eb;
`;

export const WhiteButton = styled.button`
  color: #374151;
  margin-top: 1rem;
  background-color: #fff;
  padding: 0.5rem 1rem;
  border: 1px solid #d2d6dc;
  outline: 0;
  border-radius: 15px;
  font-weight: 500;
  font-size: 1rem;
  display: inline-block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
  :hover {
    opacity: 0.9;
  }
`;

export const VioletButton = styled.button`
  display: inline-block;
  padding: 10px 40px;
  background-color: #5145cd;
  color: #fff;
  font-size: 16px;
  text-align: center;
  font-weight: 700;
  margin: 25px auto 10px;
  border-radius: 30px;
  border: none;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
  :hover {
    opacity: 0.9;
  }
`;

export const InterTitle = styled.div`
  font-size: 2rem;
  color: #9d9e9f;
  width: 100%;
  text-align: center;
`;
