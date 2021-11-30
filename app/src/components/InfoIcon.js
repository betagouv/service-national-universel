import React from "react";
import styled from "styled-components";

const InfoIcon = ({ ...props }) => {
  return (
    <Container {...props}>
      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 8A8 8 0 110 8a8 8 0 0116 0zM9 4a1 1 0 11-2 0 1 1 0 012 0zM7 7a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2V8a1 1 0 00-1-1H7z"
        />
      </svg>
    </Container>
  );
};

export default InfoIcon;

const Container = styled.div`
  svg {
    height: 20px;
  }
  svg path {
    fill: ${({ color }) => `${color}`};
  }
`;
