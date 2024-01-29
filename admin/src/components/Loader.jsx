import React from "react";
import ReactLoading from "react-loading";
import styled from "styled-components";

export default function Loader({ type = "spin", size = "3rem", color = "#5245cc", className = "", containerClassName = "" }) {
  return (
    <Container className={containerClassName}>
      <ReactLoading type={type} color={color} width={size} height={size} className={className} />
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
