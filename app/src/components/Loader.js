import React from "react";
import ReactLoading from "react-loading";
import styled from "styled-components";

export default function Loader({ size = "3rem" }) {
  return (
    <Container>
      <ReactLoading type="spin" color="#5245cc" width={size} height={size} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex: 1;
  justify-content: center;
  align-items: center;
  > div {
    margin: 1rem;
  }
`;
