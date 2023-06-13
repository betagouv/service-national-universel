import React from "react";
import styled from "styled-components";

import Inscription from "../dashboard/inscription";

export default function Dashboard() {
  return (
    <>
      <Wrapper>
        <Inscription />
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  padding: 1.5rem;
  @media print {
    background-color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 2rem;
    z-index: 999;
  }
`;
