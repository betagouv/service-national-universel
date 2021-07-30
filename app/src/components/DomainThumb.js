import React from "react";
import styled from "styled-components";

export default ({ domain = "default", backgroundColor = "#42389d", size = "3rem", sizeMobile = "3rem", style }) => (
  <Thumb backgroundColor={backgroundColor} size={size} sizeMobile={sizeMobile} style={style}>
    <img src={require(`../assets/mission-domains/${domain}.svg`)} />
  </Thumb>
);

const Thumb = styled.div`
  margin-right: 20px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  height: ${({ size }) => size};
  width: ${({ size }) => size};
  border-radius: 4px;
  padding: 0.7rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  @media (max-width: 768px) {
    height: ${({ sizeMobile }) => sizeMobile};
    width: ${({ sizeMobile }) => sizeMobile};
    margin-right: 10px;
    padding: 0.4rem;
  }
  img {
    border-radius: 6px;
    height: 100%;
    width: 100%;
    object-fit: cover;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;
