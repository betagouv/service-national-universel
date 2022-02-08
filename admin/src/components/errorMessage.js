import React from "react";
import styled from "styled-components";

export default function ErrorMessage({ errors, name }) {
  if (name && name.includes(".")) {
    const nameArray = name.split(".");
    return <Error>{errors[nameArray[0]]?.[nameArray[1]]}</Error>;
  }
  return <Error>{errors[name]}</Error>;
}

const Error = styled.div`
  color: red;
  font-weight: 400;
  font-size: 12px;
  margin-top: 2px;
`;

export const requiredMessage = "Ce champ est obligatoire";
