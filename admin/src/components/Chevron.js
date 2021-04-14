import React from "react";
import styled from "styled-components";

export default ({ ...props }) => (
  <ChevronContainer {...props}>
    <svg viewBox="0 0 407.437 407.437">
      <polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 " />
    </svg>
  </ChevronContainer>
);

const ChevronContainer = styled.div`
  margin-left: auto;
  padding: 7px 15px;
  margin-left: 15px;
  svg {
    height: 10px;
  }
  svg polygon {
    fill: ${({ color }) => `${color}`};
  }
`;
