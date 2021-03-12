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
      cursor: loading ? "not-allowed" : "pointer",
    }}
  >
    {loading && <Spinner size="sm" style={{ borderWidth: "0.1em" }} />}
    {!loading && children}
  </VioletButtonHeader>
);

const VioletButtonHeader = styled(Button)`
  background-color: #5245cc;
  border: none;
  border-radius: 5px;
  padding: 7px 30px;
  margin: 0;
  margin-left: 1rem;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  :hover {
    background: #372f78;
  }
`;
