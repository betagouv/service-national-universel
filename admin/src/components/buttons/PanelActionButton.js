import React from "react";
import styled from "styled-components";

import LoadingButton from "./LoadingButton";

export default function DownloadButton({ icon, title, ...rest }) {
  return (
    <Button icon={require(`../../assets/${icon}.svg`)} color="white" {...rest}>
      {title}
    </Button>
  );
}

const Button = styled(LoadingButton)`
  color: #555;
  background: ${({ icon }) => `url(${icon}) left 15px center no-repeat`};
  background-color: #fff;
  :hover {
    background: ${({ icon }) => `url(${icon}) left 15px center no-repeat`};
    background-color: #fff;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.16);
  }
  border: 1px solid #eee;
  outline: 0;
  border-radius: 5px;
  padding: 0.2rem 1rem;
  padding-left: 2.5rem;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-right: 0.5rem;
  margin-top: 0.5rem;
`;
