import React from "react";
import styled from "styled-components";

const DomainThumb = ({ domain, backgroundColor = "#42389d", size = "3rem", sizeMobile = "3rem", style }) => (
  <Thumb backgroundColor={backgroundColor} size={size} sizeMobile={sizeMobile} style={style}>
    <img src={require(`../assets/mission-domains/${(domain || "default").toLowerCase()}.svg`)} />
  </Thumb>
);

export default DomainThumb;

const Thumb = styled.div`
  margin-right: 20px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  min-height: ${({ size }) => size};
  min-width: ${({ size }) => size};
  height: ${({ size }) => size};
  width: ${({ size }) => size};
  border-radius: 4px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  @media (max-width: 768px) {
    min-height: ${({ sizeMobile }) => sizeMobile};
    min-width: ${({ sizeMobile }) => sizeMobile};
    height: ${({ sizeMobile }) => sizeMobile};
    width: ${({ sizeMobile }) => sizeMobile};
    margin-right: 10px;
  }
  img {
    height: 60%;
    width: 60%;
    object-fit: cover;
  }
`;
