import React from "react";
import { Spinner, Button } from "reactstrap";
import styled from "styled-components";

export default ({ loading, children, disabled, ...rest }) => (
  <VioletButtonHeader
    disabled={loading || disabled}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: loading ? 0.7 : 1,
      cursor: loading || disabled ? "not-allowed" : "pointer",
    }}
    {...rest}
  >
    {loading && <Spinner size="sm" style={{ borderWidth: "0.1em" }} />}
    {!loading && children}
  </VioletButtonHeader>
);

const VioletButtonHeader = styled(Button)`
  border: none;
  border-radius: 10px;
  padding: 7px 30px;
  margin: 0;
  margin-left: 1rem;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  color: #fff;
  background-color: #5245cc;
  min-width: 80%;
  max-width: 80%;
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.16);
  :hover {
    color: #fff;
    background-color: #5245cc;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.5);
  }
`;
