import React from "react";
import styled from "styled-components";

export default function Checkbox({ isChecked, onChange, label, name }) {
  const handleChange = () => {
    onChange(name);
  };

  return (
    <StyledCheckbox>
      <StyledCheckboxInput checked={isChecked} onChange={handleChange} type="checkbox" name={name} id={name} value={label} />
      <StyledCheckboxLabel htmlFor={name}>{label}</StyledCheckboxLabel>
    </StyledCheckbox>
  );
}

const StyledCheckbox = styled.div`
  background-color: white;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  padding: 5px 10px;
`;

const StyledCheckboxInput = styled.input`
  position: absolute;
  z-index: -1;
  opacity: 0;

  &:not(:disabled):not(:checked) + label:hover::before {
    border-color: #b3d7ff;
  }
  &:not(:disabled):active + label::before {
    background-color: #b3d7ff;
    border-color: #b3d7ff;
  }
  &:focus + label::before {
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
  &:focus:not(:checked) + label::before {
    border-color: #80bdff;
  }
  &:checked + label::before {
    border-color: #3dd598;
    background-color: #3dd598;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/%3e%3c/svg%3e");
  }
  &:disabled + label::before {
    background-color: #e9ecef;
  }
`;
const StyledCheckboxLabel = styled.label`
  color: #242526;
  margin: 0;
  display: inline-flex;
  align-items: center;
  user-select: none;

  &::before {
    content: "";
    display: inline-block;
    width: 1em;
    height: 1em;
    flex-shrink: 0;
    flex-grow: 0;
    border: 1px solid #adb5bd;
    border-radius: 0.25em;
    margin-right: 0.5em;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 50% 50%;
  }
`;
