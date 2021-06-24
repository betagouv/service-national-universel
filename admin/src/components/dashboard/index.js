import React from "react";
import styled from "styled-components";

export const CardArrow = styled.span`
  width: 15px;
  height: 15px;
  background-image: url(${require("../../assets/arrow.png")});
`;

const CardStyle = styled.div`
  /* max-width: 325px; */
  padding: 22px 15px;
  border-bottom: 7px solid ${(props) => props.borderBottomColor};
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  margin-bottom: 33px;
`;

const CardStyleGrey = styled.div`
  /* max-width: 325px; */
  padding: 22px 15px;
  border-bottom: 7px solid ${(props) => props.borderBottomColor};
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  background-color: #fcfcfc;
  margin-bottom: 33px;
`;

export const Card = ({ children, ...p }) => <CardStyle {...p}>{children}</CardStyle>;

export const CardGrey = ({ children, ...p }) => <CardStyleGrey {...p}>{children}</CardStyleGrey>;

export const CardTitle = styled.h3`
  color: #171725;
  font-size: 16px;
  font-weight: bold;
`;
export const CardSubtitle = styled.h3`
  font-size: 14px;
  font-weight: 100;
  color: #696974;
`;

export const CardPercentage = styled.span`
  font-size: 22px;
  color: #a8a8b1;
  display: flex;
  align-items: center;
  font-weight: 100;
`;

export const CardValueWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
`;
export const CardValue = styled.span`
  font-size: 28px;
`;

export const Subtitle = styled.h3`
  color: #242526;
  font-size: 26px;
  margin-bottom: 20px;
  font-weight: normal;
`;

export const CardSection = styled.div`
  font-family: Ubuntu;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 18px;
  text-transform: uppercase;
  color: #372f78;
`;

export const CardContainer = styled.div`
  margin-bottom: 33px;
`;
