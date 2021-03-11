import React from "react";
import { requiredMessage } from "./errorMessage";
import styled from "styled-components";
import { Field } from "formik";

export default ({ title, handleChange, name, value, values, onClick }) => {
  const handleClick = () => {
    if (values[name] === value) value = "";
    if (onClick) onClick();
    if (handleChange) handleChange({ target: { name, value } });
  };

  return (
    <Container selected={(values[name] && values[name] === value) || (Array.isArray(values[name]) && values[name].indexOf(value) !== -1)} onClick={handleClick}>
      <Field
        hidden
        validate={(v) => {
          if (!v) return requiredMessage;
          if (Array.isArray(v) && v.length === 0) return requiredMessage;
        }}
        name={name}
      />
      {title}
    </Container>
  );
};

const Container = styled.div`
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 0.5rem 1.25rem;
  border-width: 1px;
  border-radius: 9999px;
  border-style: solid;
  cursor: pointer;
  border-color: #d2d6dc;
  color: ${({ selected }) => (selected ? "#fff" : "#374151")};
  background-color: ${({ selected }) => (selected ? "#42389d" : "#fff")};
  :hover {
    background-color: ${({ selected }) => (selected ? "#42389dbb" : "#f9fafb")};
  }
  margin: 0.5rem 0.5rem;
  display: flex;
  align-items: center;
  width: fit-content;
`;
