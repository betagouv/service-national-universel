import React from "react";
import { Spinner, Button } from "reactstrap";
import styled from "styled-components";

export default ({ loading, children, disabled, ...rest }) => (
  <VioletButtonHeader
    {...rest}
    disabled={loading || disabled}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: loading ? 0.7 : 1,
      cursor: loading || disabled ? "not-allowed" : "pointer",
    }}
  >
    {loading && <Spinner size="sm" style={{ borderWidth: "0.1em" }} />}
    {!loading && children}
  </VioletButtonHeader>
);

const VioletButtonHeader = styled(Button)`
  background-color: #5245cc !important;
  border: none;
  border-radius: 5px;
  padding: 7px 30px;
  margin: 0;
  margin-left: 1rem;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  :hover {
    background: #372f78 !important;
  }
`;
