import React from "react";
import Contract from "../../../components/Contract";
import Wrapper from "./wrapper";

export default function Phase2Contract({ young }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <Wrapper young={young} tab="contract">
        <Contract young={young} admin={false} />
      </Wrapper>
    </div>
  );
}
