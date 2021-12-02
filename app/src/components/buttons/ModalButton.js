import React from "react";
import { Spinner, Button } from "reactstrap";
import styled from "styled-components";
import { colors } from "../../utils";

export default function ModalButton({ primary, secondary, loading, children, disabled, ...rest }) {
  const getBackgroundColor = () => {
    if (disabled) return colors.grey;
    if (primary) return colors.purple;
    if (secondary) return "#ffffff";
    return "#ffffff";
  };
  const getColor = () => {
    if (disabled) return "#bbbbbb";
    if (primary) return "#ffffff";
    if (secondary) return colors.grey;
    return colors.grey;
  };
  return (
    <VioletButtonHeader
      {...rest}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: loading ? 0.7 : 1,
        cursor: loading || disabled ? "not-allowed" : "pointer",
        backgroundColor: getBackgroundColor(),
        color: getColor(),
        fontWeight: primary ? "700" : "500",
      }}
      disabled={loading || disabled}>
      {loading && <Spinner size="sm" style={{ borderWidth: "0.1em" }} />}
      {!loading && children}
    </VioletButtonHeader>
  );
}

const VioletButtonHeader = styled(Button)`
  border: 0;
  border-radius: 5px;
  padding: 7px 30px;
  margin: 0.3rem;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background-color: #fff;
  min-width: 80%;
  max-width: 80%;
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1);
  :hover {
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.6);
  }
`;
