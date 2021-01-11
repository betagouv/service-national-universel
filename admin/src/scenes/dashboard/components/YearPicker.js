import React, { useState } from "react";
import styled from "styled-components";

export default ({ options, value, onChange }) => {
  return (
    <YearPickerWrapper>
      {options.map((key, index) => {
        return (
          <StyledOption key={key} isActive={key === value} onClick={() => onChange(key)}>
            {key}
          </StyledOption>
        );
      })}
    </YearPickerWrapper>
  );
};

const YearPickerWrapper = styled.div`
  display: flex;
  padding: 5px;
  background-color: white;
  border-radius: 6px;
`;
const StyledOption = styled.div`
  padding: 2px 14px;
  color: ${(props) => (props.isActive ? "white" : "#44444F")};
  background-color: ${(props) => props.isActive && "#696974"};
  border-radius: 6px;
`;
