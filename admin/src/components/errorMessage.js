import React from "react";
import styled from "styled-components";

export default ({ errors, touched, name }) => {
  return <Error>{errors[name]}</Error>;
};

const Error = styled.div`
  color: red;
  font-weight: 400;
  font-size: 12px;
  margin-top: 2px;
`;

export const requiredMessage = "Ce champ est obligatoire";
