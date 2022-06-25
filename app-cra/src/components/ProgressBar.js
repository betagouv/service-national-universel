import React from "react";
import styled from "styled-components";

export default function ProgressBar({ backgroundColor, backgroundColorCompleted, completed }) {
  return (
    <Container backgroundColor={backgroundColorCompleted}>
      <Filler backgroundColor={backgroundColor} completed={completed}>
        <Label>{`${completed}`} %</Label>
      </Filler>
    </Container>
  );
}

const Container = styled.div`
  height: 20;
  width: 100%;
  max-width: 1270px;
  background-color: ${({ backgroundColor }) => backgroundColor || "#e0e0e0"};
  border-radius: 1rem;
  margin: 0.1rem auto 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;
const Filler = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0 0.8rem;
  height: 100%;
  width: ${({ completed }) => completed + "%"};
  min-width: 50px;
  background-color: ${({ backgroundColor }) => backgroundColor || "#fff"};
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;

const Label = styled.span`
  padding: 5;
  color: white;
  font-weight: 500;
`;
