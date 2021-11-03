import React from "react";
import styled from "styled-components";

export default ({ ...props }) => (
  <BackContainer {...props}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.707 9.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L3.414 4H15a1 1 0 110 2H3.414l2.293 2.293a1 1 0 010 1.414z"
      />
    </svg>
  </BackContainer>
);

const BackContainer = styled.div`
  svg {
    height: 17px;
  }
  svg path {
    fill: ${({ color }) => `${color}`};
  }
`;
